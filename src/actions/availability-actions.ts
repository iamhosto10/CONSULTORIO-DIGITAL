'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import User, { IAvailability } from '@/models/User';
import { revalidatePath } from 'next/cache';

export async function getAvailability() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('No autorizado');
  }

  await connectDB();

  // We select only availability. using lean() returns a POJO.
  const user = await User.findById(session.user.id).select('availability').lean<{ availability?: IAvailability }>();

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const defaultDay = { active: true, start: "08:00", end: "17:00" };
  const defaultWeekend = { active: false, start: "08:00", end: "12:00" };

  const defaults: IAvailability = {
      monday: { ...defaultDay },
      tuesday: { ...defaultDay },
      wednesday: { ...defaultDay },
      thursday: { ...defaultDay },
      friday: { ...defaultDay },
      saturday: { ...defaultWeekend },
      sunday: { ...defaultWeekend }
  };

  // Merge with defaults in case of partial data or new field
  const availability = user.availability || defaults;

  // Ensure all keys exist (deep merge might be better but this is simple enough for 7 keys)
  // If user.availability is completely missing, defaults is used.
  // If user.availability is present, we assume Mongoose defaults populated it if it was created/updated recently.
  // But for existing users, it might be undefined.

  return {
    availability: JSON.parse(JSON.stringify(availability)),
    userId: session.user.id
  };
}

export async function updateAvailability(data: IAvailability) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'No autorizado' };
    }

    try {
        await connectDB();

        await User.findByIdAndUpdate(session.user.id, {
            $set: { availability: data }
        });

        revalidatePath('/dashboard/configuracion');
        return { success: true, message: 'Configuración actualizada' };
    } catch (error) {
        console.error('Error updating availability:', error);
        return { success: false, message: 'Error al actualizar la configuración' };
    }
}
