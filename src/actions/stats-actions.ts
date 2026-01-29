'use server';

import { auth } from '@/auth';
import { connectDB as dbConnect } from '@/lib/db';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import Patient from '@/models/Patient'; // Import implicit for population
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import mongoose from 'mongoose';

export interface DashboardStats {
  totalPacientes: number;
  citasHoy: number;
  citasPendientes: number;
  ingresosMes: number;
  chartData: { name: string; total: number }[];
  upcomingAppointments: { id: string; patientName: string; date: Date; time: string }[];
}

interface PopulatedAppointment {
  _id: mongoose.Types.ObjectId;
  fechaInicio: Date;
  patientId: {
    nombre: string;
  } | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  const userId = session.user.id;
  await dbConnect();

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Parallelize independent queries
  const [totalPacientes, citasHoy, citasPendientes, ingresosResult] = await Promise.all([
    Patient.countDocuments({ professionalId: userId }),
    Appointment.countDocuments({
      professionalId: userId,
      fechaInicio: { $gte: todayStart, $lte: todayEnd },
    }),
    Appointment.countDocuments({
      professionalId: userId,
      estado: AppointmentStatus.PENDIENTE,
    }),
    Appointment.aggregate([
      {
        $match: {
          professionalId: new mongoose.Types.ObjectId(userId),
          'payment.status': 'pagado',
          fechaInicio: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$payment.amount' },
        },
      },
    ]),
  ]);

  const ingresosMes = ingresosResult[0]?.total || 0;

  // Chart Data (Last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i)); // 7 days ending today

  const chartQueries = days.map(day =>
    Appointment.countDocuments({
      professionalId: userId,
      fechaInicio: { $gte: startOfDay(day), $lte: endOfDay(day) }
    })
  );

  const chartCounts = await Promise.all(chartQueries);

  const chartData = days.map((day, index) => ({
    name: format(day, 'EEE', { locale: es }).replace(/^\w/, c => c.toUpperCase()), // Lun, Mar... Capitalized
    total: chartCounts[index]
  }));

  // Upcoming Appointments
  const upcomingRaw = await Appointment.find({
    professionalId: userId,
    fechaInicio: { $gt: now },
  })
    .sort({ fechaInicio: 1 })
    .limit(3)
    .populate('patientId', 'nombre')
    .lean();

  const upcomingAppointments = (upcomingRaw as unknown as PopulatedAppointment[]).map((app) => ({
    id: app._id.toString(),
    patientName: app.patientId?.nombre || 'Paciente Desconocido',
    date: app.fechaInicio,
    time: format(app.fechaInicio, 'HH:mm'),
  }));

  return {
    totalPacientes,
    citasHoy,
    citasPendientes,
    ingresosMes,
    chartData,
    upcomingAppointments,
  };
}
