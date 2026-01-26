'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Patient from '@/models/Patient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const noteSchema = z.object({
  nota: z.string().min(1, { message: 'La nota no puede estar vacía' }),
  diagnostico: z.string().optional(),
});

export async function addClinicalNote(
  patientId: string,
  prevState: any,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  const rawData = {
    nota: formData.get('nota') as string,
    diagnostico: formData.get('diagnostico') as string,
  };

  const validation = noteSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    await connectDB();

    // Verify patient belongs to the professional
    const patient = await Patient.findOne({
      _id: patientId,
      professionalId: session.user.id,
    });

    if (!patient) {
      return { success: false, message: 'Paciente no encontrado o no autorizado' };
    }

    const newNote = {
      fecha: new Date(),
      nota: validation.data.nota,
      diagnostico: validation.data.diagnostico || '',
    };

    await Patient.updateOne(
      { _id: patientId },
      { $push: { historiaClinica: newNote } }
    );

    revalidatePath(`/dashboard/pacientes/${patientId}`);
    return { success: true, message: 'Nota agregada correctamente' };
  } catch (error) {
    console.error('Error adding clinical note:', error);
    return { success: false, message: 'Error al agregar la nota' };
  }
}
