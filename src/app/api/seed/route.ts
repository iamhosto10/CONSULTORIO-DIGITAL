import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    const email = "admin@admin.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: 'El usuario ya existe' });
    }

    const password = await bcrypt.hash("123456", 10);

    await User.create({
      nombre: "Dr. Prueba",
      email,
      password,
      especialidad: "Medicina General",
      registroMedico: "TP-123456"
    });

    return NextResponse.json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: 'Error interno del servidor', error: String(error) }, { status: 500 });
  }
}
