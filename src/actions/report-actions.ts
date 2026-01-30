'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Appointment from '@/models/Appointment';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Patient from '@/models/Patient'; // Ensure Patient model is registered
import { format, startOfMonth, endOfMonth } from 'date-fns';

export interface ReportData {
  Fecha: string;
  Paciente: string;
  Documento: string;
  Concepto: string;
  Metodo_Pago: string;
  Monto: number;
}

interface PopulatedAppointment {
  fechaInicio: Date;
  patientId?: {
    nombre: string;
    cedula: string;
  } | null;
  notas?: string;
  payment?: {
    method: string;
    amount: number;
  };
}

export async function getMonthlyReportData(month: number, year: number): Promise<ReportData[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  const userId = session.user.id;
  await connectDB();

  // Create date object for the specified month/year
  // month is 0-indexed (0=January, 11=December)
  const targetDate = new Date(year, month, 1);
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);

  // Query appointments
  const appointments = await Appointment.find({
    professionalId: userId,
    'payment.status': 'pagado',
    fechaInicio: { $gte: startDate, $lte: endDate }
  })
  .populate('patientId', 'nombre cedula')
  .sort({ fechaInicio: 1 })
  .lean();

  // Transform data for Excel
  return (appointments as unknown as PopulatedAppointment[]).map((app) => ({
    Fecha: format(new Date(app.fechaInicio), 'yyyy-MM-dd'),
    Paciente: app.patientId?.nombre || 'Desconocido',
    Documento: app.patientId?.cedula || 'N/A',
    Concepto: app.notas || 'Consulta',
    Metodo_Pago: app.payment?.method || 'Desconocido',
    Monto: app.payment?.amount || 0
  }));
}
