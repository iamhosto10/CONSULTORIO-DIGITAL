'use server';

import { connectDB } from '@/lib/db';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import Patient from '@/models/Patient';
import User, { IAvailability } from '@/models/User';
import mongoose from 'mongoose';
import { resend } from '@/lib/mail';
import { getAppointmentConfirmationEmail } from '@/lib/email-templates';

export async function getPublicAvailability(professionalId: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(professionalId)) {
      console.error('Invalid professionalId:', professionalId);
      return [];
    }

    // Fetch appointments that are not cancelled
    // We only return start/end times for privacy
    const appointments = await Appointment.find({
      professionalId,
      estado: { $ne: AppointmentStatus.CANCELADA },
    })
      .select('fechaInicio fechaFin')
      .lean<{ fechaInicio: Date; fechaFin: Date }[]>();

    const realAppointments = appointments.map((appt) => ({
      start: appt.fechaInicio,
      end: appt.fechaFin,
    }));

    // Generate artificial blocking events based on availability
    const doctor = await User.findById(professionalId).select('availability').lean<{ availability?: IAvailability }>();
    const blockingEvents: { start: Date; end: Date }[] = [];

    if (doctor?.availability) {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 90); // Generate blocks for next 90 days

      const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      // Iterate date by date
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayName = daysMap[d.getDay()] as keyof IAvailability;
        const config = doctor.availability[dayName];

        const year = d.getFullYear();
        const month = d.getMonth();
        const date = d.getDate();

        // If no config or not active, block the whole day
        if (!config || !config.active) {
          blockingEvents.push({
            start: new Date(year, month, date, 0, 0, 0),
            end: new Date(year, month, date, 23, 59, 59, 999),
          });
        } else {
          // If active, block before start and after end
          const [startH, startM] = config.start.split(':').map(Number);
          const [endH, endM] = config.end.split(':').map(Number);

          const startOfDay = new Date(year, month, date, 0, 0, 0);
          const workStart = new Date(year, month, date, startH, startM, 0);
          const workEnd = new Date(year, month, date, endH, endM, 0);
          const endOfDay = new Date(year, month, date, 23, 59, 59, 999);

          // Block morning (00:00 - Start)
          if (workStart > startOfDay) {
            blockingEvents.push({ start: startOfDay, end: workStart });
          }

          // Block evening (End - 23:59)
          if (endOfDay > workEnd) {
             blockingEvents.push({ start: workEnd, end: endOfDay });
          }
        }
      }
    }

    return [...realAppointments, ...blockingEvents];
  } catch (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
}

export async function bookPublicAppointment(formData: FormData) {
  try {
    await connectDB();

    const professionalId = formData.get('professionalId') as string;
    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const telefono = formData.get('telefono') as string;
    const cedula = formData.get('cedula') as string;
    const startStr = formData.get('fechaInicio') as string;
    const endStr = formData.get('fechaFin') as string;

    // Basic validation
    if (!professionalId || !nombre || !email || !telefono || !cedula || !startStr || !endStr) {
      return { success: false, message: 'Todos los campos son obligatorios' };
    }

    if (!mongoose.Types.ObjectId.isValid(professionalId)) {
      return { success: false, message: 'ID del profesional inválido' };
    }

    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, message: 'Fechas inválidas' };
    }

    if (start >= end) {
       return { success: false, message: 'La fecha de inicio debe ser anterior al fin' };
    }

    // Validate Doctor Availability
    const doctor = await User.findById(professionalId).select('availability nombre');
    if (!doctor) {
      return { success: false, message: 'Doctor no encontrado' };
    }

    if (doctor.availability) {
      const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = start.getUTCDay(); // 0=Sun, 1=Mon...
      const dayKey = daysMap[dayIndex] as keyof IAvailability;
      const dayConfig = doctor.availability[dayKey];

      if (!dayConfig || !dayConfig.active) {
        const diasEs = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return { success: false, message: `El doctor no atiende los ${diasEs[dayIndex]}` };
      }

      const timeCheck = isTimeWithinRange(start, dayConfig.start, dayConfig.end);
      if (timeCheck === 'before') {
        return { success: false, message: `El doctor empieza a atender a las ${dayConfig.start}` };
      }
      if (timeCheck === 'after') {
        return { success: false, message: `El doctor termina su turno a las ${dayConfig.end}` };
      }
    }

    // 1. Find or Create Patient
    // Scope search to the professional
    let patient = await Patient.findOne({
      email,
      professionalId,
    });

    if (!patient) {
      // Create new patient
      patient = await Patient.create({
        professionalId,
        nombre,
        email,
        telefono,
        cedula,
        historiaClinica: [],
      });
    } else {
      // Update existing patient info if needed
      patient.cedula = cedula;
      patient.nombre = nombre;
      patient.telefono = telefono;
      await patient.save();
    }

    // 2. Check for conflicts
    // Formula: (ExistingStart < NewEnd) && (ExistingEnd > NewStart)
    const conflict = await Appointment.findOne({
      professionalId,
      estado: { $ne: AppointmentStatus.CANCELADA },
      $and: [
        { fechaInicio: { $lt: end } },
        { fechaFin: { $gt: start } }
      ]
    });

    if (conflict) {
      return { success: false, message: 'El horario seleccionado ya no está disponible' };
    }

    // 3. Create Appointment
    await Appointment.create({
      professionalId,
      patientId: patient._id,
      fechaInicio: start,
      fechaFin: end,
      costo: 0, // Default cost as required
      estado: AppointmentStatus.PENDIENTE,
      notas: 'Solicitud desde perfil público',
    });

    // Send confirmation email
    try {
      const doctorName = doctor ? doctor.nombre : 'Doctor';

      const formattedDate = new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(start);

      const htmlContent = getAppointmentConfirmationEmail(nombre, formattedDate, doctorName);

      await resend.emails.send({
        from: 'Consultorio <onboarding@resend.dev>',
        to: email,
        subject: `Confirmación de Cita - Dr. ${doctorName}`,
        html: htmlContent
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Non-blocking error
    }

    return { success: true, message: 'Solicitud enviada' };

  } catch (error) {
    console.error('Error booking appointment:', error);
    return { success: false, message: 'Ocurrió un error al procesar la solicitud' };
  }
}

function isTimeWithinRange(date: Date, startStr: string, endStr: string): 'before' | 'after' | 'within' {
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const dateH = date.getUTCHours();
  const dateM = date.getUTCMinutes();

  const dateMinutes = dateH * 60 + dateM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (dateMinutes < startMinutes) return 'before';
  if (dateMinutes > endMinutes) return 'after';
  return 'within';
}
