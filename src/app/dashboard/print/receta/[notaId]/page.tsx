import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Patient, { IPatient } from '@/models/Patient';
import User, { IUser } from '@/models/User';
import { notFound } from 'next/navigation';
import AutoPrint from './AutoPrint';
import PrescriptionTemplate from '@/components/print/PrescriptionTemplate';

interface PageProps {
  params: Promise<{ notaId: string }>;
}

// Helper interface for the populated patient
interface IPatientPopulated extends Omit<IPatient, 'professionalId'> {
  professionalId: IUser;
}

export default async function PrintPrescriptionPage(props: PageProps) {
  const params = await props.params;
  const { notaId } = params;

  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  await connectDB();

  // Find the patient that contains the note in historiaClinica
  // and belongs to the current user (professional)
  const patient = await Patient.findOne({
    "historiaClinica._id": notaId,
    professionalId: session.user.id,
  }).populate<{ professionalId: IUser }>('professionalId').lean<IPatientPopulated>();

  if (!patient) {
    return notFound();
  }

  // Find the specific note
  const note = patient.historiaClinica.find(
    (record: any) => record._id.toString() === notaId
  );

  if (!note) {
    return notFound();
  }

  const doctor = patient.professionalId;

  return (
    <>
      <AutoPrint />
      <PrescriptionTemplate
        doctor={{
            nombre: doctor.nombre,
            especialidad: doctor.especialidad,
            registroMedico: doctor.registroMedico,
            email: doctor.email
        }}
        patient={{
            nombre: patient.nombre,
            cedula: patient.cedula
        }}
        note={{
            fecha: note.fecha,
            diagnostico: note.diagnostico,
            nota: note.nota
        }}
      />
    </>
  );
}
