import { connectDB } from '@/lib/db';
import User, { IUser } from '@/models/User';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import mongoose from 'mongoose';

interface Props {
  params: Promise<{ userId: string }>;
}

// Define a type for the data we select
type PublicDoctorProfile = Pick<IUser, 'nombre' | 'especialidad' | 'registroMedico' | 'email'>;

async function getDoctor(userId: string): Promise<PublicDoctorProfile | null> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  await connectDB();

  const user = await User.findById(userId)
    .select('nombre especialidad registroMedico email')
    .lean<PublicDoctorProfile>();

  return user || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const doctor = await getDoctor(userId);

  if (!doctor) {
    return {
      title: 'Profesional no encontrado | Consultorio Digital',
      description: 'El perfil profesional que buscas no está disponible.'
    };
  }

  return {
    title: `Dr. ${doctor.nombre} - ${doctor.especialidad} | Consultorio Digital`,
    description: `Agenda tu cita con el Dr. ${doctor.nombre} de forma rápida y segura.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params;
  const doctor = await getDoctor(userId);

  if (!doctor) {
    notFound();
  }

  // Get initials for avatar
  const initials = doctor.nombre
    ? doctor.nombre
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'Dr';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-blue-600 py-4 shadow-md">
            <div className="container mx-auto px-4">
                <h1 className="text-white text-lg font-semibold tracking-wide">Consultorio Digital</h1>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Upper decorative background */}
                <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                <div className="px-8 pb-8">
                    {/* Avatar (negative margin to pull it up) */}
                    <div className="relative -mt-16 mb-6 flex justify-center">
                        <div className="h-32 w-32 rounded-full bg-white p-1.5 shadow-lg">
                            <div className="h-full w-full rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-4xl font-bold border-2 border-blue-100">
                                {initials}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                            {doctor.nombre}
                        </h2>
                        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-2">
                            {doctor.especialidad}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                            <span className="font-medium">Registro Médico:</span>
                            <span>{doctor.registroMedico}</span>
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-8 space-y-4">
                        <a
                            href="#agendar"
                            className="block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-lg rounded-xl transition duration-200 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5"
                        >
                            Agendar Cita Ahora
                        </a>
                        <p className="text-xs text-center text-gray-400">
                            Reserva segura y confidencial
                        </p>
                    </div>
                </div>
            </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Consultorio Digital. Todos los derechos reservados.
        </footer>
    </div>
  );
}
