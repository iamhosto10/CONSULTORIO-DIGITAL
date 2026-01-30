'use server';

import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Patient from '@/models/Patient';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const patientSchema = z.object({
  cedula: z.string().min(3, { message: 'La cédula debe tener al menos 3 caracteres' }),
  nombre: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
  email: z.union([z.string().email({ message: 'Email inválido' }), z.literal('')]).optional(),
  telefono: z.union([z.string().min(10, { message: 'El teléfono debe tener al menos 10 caracteres' }), z.literal('')]).optional(),
});

export async function createPatient(prevState: any, formData: FormData) {
  const rawData = {
    cedula: formData.get('cedula') as string,
    nombre: formData.get('nombre') as string,
    email: (formData.get('email') as string) || '',
    telefono: (formData.get('telefono') as string) || '',
  };

  const validation = patientSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  try {
    await connectDB();

    const existingPatient = await Patient.findOne({
      cedula: validation.data.cedula,
      professionalId: session.user.id,
    });

    if (existingPatient) {
      return { success: false, message: 'Paciente ya registrado' };
    }

    const patientData = {
      ...validation.data,
      professionalId: session.user.id,
    };

    await Patient.create(patientData);

    revalidatePath('/dashboard/pacientes');
    return { success: true, message: 'Paciente creado' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al crear el paciente' };
  }
}

export async function getPatients(query?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  await connectDB();

  const filter: any = { professionalId: session.user.id };
  if (query) {
    const regex = new RegExp(query, 'i');
    filter.$or = [{ nombre: regex }, { cedula: regex }];
  }

  const patients = await Patient.find(filter).sort({ createdAt: -1 }).lean();

  return JSON.parse(JSON.stringify(patients));
}

export async function getFilteredPatients(query?: string, currentPage: number = 1) {
  const session = await auth();
  if (!session?.user?.id) {
    return { patients: [], totalPages: 0 };
  }

  await connectDB();

  const ITEMS_PER_PAGE = 10;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const filter: any = { professionalId: session.user.id };
  if (query) {
    const regex = new RegExp(query, 'i');
    filter.$or = [{ nombre: regex }, { cedula: regex }, { email: regex }];
  }

  const [patients, totalCount] = await Promise.all([
    Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    patients: JSON.parse(JSON.stringify(patients)),
    totalPages,
  };
}

export async function updatePatient(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return { success: false, message: 'ID de paciente requerido' };
  }

  const rawData = {
    cedula: formData.get('cedula') as string,
    nombre: formData.get('nombre') as string,
    email: (formData.get('email') as string) || '',
    telefono: (formData.get('telefono') as string) || '',
  };

  const validation = patientSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  try {
    await connectDB();

    const patient = await Patient.findOne({ _id: id, professionalId: session.user.id });

    if (!patient) {
      return { success: false, message: 'Paciente no encontrado o no autorizado' };
    }

    if (patient.cedula !== validation.data.cedula) {
      const existing = await Patient.findOne({
        cedula: validation.data.cedula,
        professionalId: session.user.id,
      });
      if (existing) {
        return { success: false, message: 'Paciente ya registrado' };
      }
    }

    await Patient.updateOne({ _id: id }, validation.data);

    revalidatePath('/dashboard/pacientes');
    return { success: true, message: 'Paciente actualizado' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al actualizar el paciente' };
  }
}

export async function deletePatient(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return { success: false, message: 'ID de paciente requerido' };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'No autenticado' };
  }

  try {
    await connectDB();

    const result = await Patient.deleteOne({ _id: id, professionalId: session.user.id });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Paciente no encontrado o no autorizado' };
    }

    revalidatePath('/dashboard/pacientes');
    return { success: true, message: 'Paciente eliminado' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Error al eliminar el paciente' };
  }
}
