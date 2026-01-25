'use server';

import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingrese un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  especialidad: z.string().min(1, 'La especialidad es requerida'),
  registroMedico: z.string().min(1, 'El registro médico es requerido'),
});

interface RegisterState {
  errors?: {
    nombre?: string[];
    email?: string[];
    password?: string[];
    especialidad?: string[];
    registroMedico?: string[];
    _form?: string[];
  };
  message?: string;
}

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // Validate fields
  const validatedFields = registerSchema.safeParse({
    nombre: formData.get('nombre'),
    email: formData.get('email'),
    password: formData.get('password'),
    especialidad: formData.get('especialidad'),
    registroMedico: formData.get('registroMedico'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error en los campos. Por favor revise el formulario.',
    };
  }

  const { nombre, email, password, especialidad, registroMedico } = validatedFields.data;

  try {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        errors: {
          email: ['El correo ya está registrado'],
        },
        message: 'El correo ya está registrado',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      nombre,
      email,
      password: hashedPassword,
      especialidad,
      registroMedico,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return {
      message: 'Error de base de datos: No se pudo crear el usuario.',
    };
  }

  // Redirect after successful registration
  redirect('/login');
}
