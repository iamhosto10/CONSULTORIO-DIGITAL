'use server';

import { connectDB } from '@/lib/db';
import Appointment, { AppointmentStatus } from '@/models/Appointment';
import Patient from '@/models/Patient';
import User from '@/models/User';
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

    return appointments.map((appt) => ({
      start: appt.fechaInicio,
      end: appt.fechaFin,
    }));
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
      const doctor = await User.findById(professionalId).select('nombre');
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
