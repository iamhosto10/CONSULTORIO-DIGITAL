import { connectDB } from '@/lib/db';
import User, { IUser } from '@/models/User';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import mongoose from 'mongoose';
import PublicCalendar from '@/components/public/PublicCalendar';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';

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
    title: `Dr. ${doctor.nombre} | Agenda tu Cita`,
    description: `Reserva tu cita médica con el Dr. ${doctor.nombre}. Ver disponibilidad y horarios. ${doctor.especialidad}`,
    openGraph: {
      title: `Dr. ${doctor.nombre} | Agenda tu Cita`,
      description: `Reserva tu cita médica con el Dr. ${doctor.nombre}. Ver disponibilidad y horarios. ${doctor.especialidad}`,
      type: 'profile',
    },
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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-50 pb-32 pt-12">
        <div className="container mx-auto px-4 text-center text-white">
           <h1 className="text-2xl font-semibold tracking-wide opacity-90">Consultorio Digital</h1>
           <p className="mt-2 text-blue-100">Reserva tu cita de manera rápida y segura</p>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-20 space-y-8 pb-12">
        {/* Doctor Card */}
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl shadow-xl border-0 overflow-visible">
                <CardContent className="pt-0 relative flex flex-col items-center pb-8">
                    {/* Avatar */}
                    <div className="-mt-16 mb-4">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-4xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="text-center space-y-2 px-4 w-full">
                        <h2 className="text-3xl font-bold text-slate-900">{doctor.nombre}</h2>
                         <div className="inline-flex items-center rounded-full border border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 text-lg py-1 px-4 font-semibold transition-colors">
                            {doctor.especialidad}
                         </div>
                        <p className="text-slate-500 mt-2 font-medium">
                            Registro Médico: {doctor.registroMedico}
                        </p>
                    </div>

                    <div className="mt-8 flex gap-4 w-full max-w-xs">
                        <Button className="w-full text-lg h-12 shadow-md" asChild>
                            <a href="#agendar">Agendar Cita</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Calendar Section */}
        <div id="agendar" className="max-w-4xl mx-auto">
             <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Agenda Disponible
                </h3>
                <p className="text-slate-500">Selecciona el horario que mejor te convenga</p>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                <PublicCalendar professionalId={userId} />
             </div>
        </div>
      </main>

       {/* Footer */}
        <footer className="py-8 text-center text-slate-400 text-sm bg-white border-t border-slate-100">
            &copy; {new Date().getFullYear()} Consultorio Digital. Todos los derechos reservados.
        </footer>
    </div>
  );
}
