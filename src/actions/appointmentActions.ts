'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Appointment from '@/models/Appointment';

export async function getAppointments() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    await connectDB();

    // Fetch appointments for the logged-in professional
    const appointments = await Appointment.find({ professionalId: session.user.id })
      .populate('patientId', 'nombre')
      .lean();

    // Serialize data to avoid "Only plain objects can be passed to Client Components" error
    return JSON.parse(JSON.stringify(appointments));
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
}
