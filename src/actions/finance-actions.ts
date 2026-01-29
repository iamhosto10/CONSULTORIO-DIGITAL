'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Appointment from '@/models/Appointment';
import { revalidatePath } from 'next/cache';

export async function registerPayment(
  appointmentId: string,
  amount: number,
  method: string
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: 'No autenticado' };
    }

    await connectDB();

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      professionalId: session.user.id,
    });

    if (!appointment) {
      return { success: false, message: 'Cita no encontrada' };
    }

    appointment.payment = {
      status: 'pagado',
      amount,
      method: method as any, // Cast to match enum type in Mongoose/TS
      date: new Date(),
    };

    await appointment.save();

    revalidatePath('/dashboard/agenda');
    revalidatePath('/dashboard');

    return { success: true, message: 'Pago registrado exitosamente' };
  } catch (error) {
    console.error('Error registering payment:', error);
    return { success: false, message: 'Error al registrar el pago' };
  }
}
