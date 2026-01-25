'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Appointment, { IAppointment } from '@/models/Appointment';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import mongoose from 'mongoose';

const appointmentSchema = z
  .object({
    patientId: z
      .string()
      .min(1, 'El ID del paciente es obligatorio')
      .regex(/^[0-9a-fA-F]{24}$/, 'ID de paciente inválido'),
    fechaInicio: z.preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return arg;
    }, z.date()),
    fechaFin: z.preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
      return arg;
    }, z.date()),
    notas: z.string().optional(),
    costo: z.coerce.number().min(0).optional().default(0),
  })
  .refine((data) => data.fechaFin > data.fechaInicio, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export async function createAppointment(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'No autenticado' };
    }

    const rawData = {
      patientId: formData.get('patientId'),
      fechaInicio: formData.get('fechaInicio'),
      fechaFin: formData.get('fechaFin'),
      notas: formData.get('notas'),
      costo: formData.get('costo'),
    };

    const validatedFields = appointmentSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Datos inválidos',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { patientId, fechaInicio, fechaFin, notas, costo } =
      validatedFields.data;

    await connectDB();

    // Detección de Conflictos
    const conflict = await Appointment.findOne({
      professionalId: session.user.id,
      estado: { $ne: 'cancelada' },
      fechaInicio: { $lt: fechaFin },
      fechaFin: { $gt: fechaInicio },
    });

    if (conflict) {
      return {
        success: false,
        message: 'El horario seleccionado ya está ocupado.',
      };
    }

    // Crear la cita
    await Appointment.create({
      professionalId: session.user.id,
      patientId,
      fechaInicio,
      fechaFin,
      notas,
      costo,
      estado: 'pendiente',
    });

    revalidatePath('/dashboard/agenda');
    return { success: true, message: 'Cita creada exitosamente' };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, message: 'Error al crear la cita' };
  }
}

export async function getAppointments(start: Date | string, end: Date | string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('No autenticado');
    }

    await connectDB();

    const startDate = new Date(start);
    const endDate = new Date(end);

    const appointments = await Appointment.find({
      professionalId: session.user.id,
      fechaInicio: { $gte: startDate, $lte: endDate },
    })
      .sort({ fechaInicio: 1 })
      .lean();

    // Serializar resultados
    return appointments.map((apt) => ({
      ...apt,
      _id: apt._id.toString(),
      professionalId: apt.professionalId.toString(),
      patientId: apt.patientId.toString(),
      fechaInicio: apt.fechaInicio.toISOString(),
      fechaFin: apt.fechaFin.toISOString(),
      createdAt: apt.createdAt.toISOString(),
      updatedAt: apt.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}
