import { auth } from '@/auth';
import { connectDB } from '@/lib/db';
import Patient, { IPatient, IClinicalRecord } from '@/models/Patient';
import { notFound } from 'next/navigation';
import ClinicalNoteForm from '@/components/patients/ClinicalNoteForm';
import { User, Phone, Mail, Calendar, Clock, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage(props: PageProps) {
  const params = await props.params;
  const { id } = params;

  const session = await auth();
  if (!session?.user?.id) {
    return notFound();
  }

  await connectDB();

  // Find patient and ensure it belongs to the logged-in professional
  const patient = await Patient.findOne({
    _id: id,
    professionalId: session.user.id,
  }).lean<IPatient>();

  if (!patient) {
    return notFound();
  }

  // Sort clinical history by date descending (newest first)
  const sortedHistory = (patient.historiaClinica || []).sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Detalle del Paciente</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-900">{patient.nombre}</h2>
                  <p className="text-sm text-blue-700">C.I: {patient.cedula}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                  <p className="text-gray-800 break-all">{patient.email || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="text-gray-800">{patient.telefono || 'No registrado'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                  <p className="text-gray-800">
                    {moment(patient.createdAt).format('LL')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex gap-2">
                 {patient.email && (
                    <a
                      href={`mailto:${patient.email}`}
                      className="flex-1 text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Enviar Email
                    </a>
                 )}
                 {patient.telefono && (
                    <a
                      href={`tel:${patient.telefono}`}
                      className="flex-1 text-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Llamar
                    </a>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Note Form */}
          <ClinicalNoteForm patientId={patient._id.toString()} />

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Historia Clínica
            </h3>

            {sortedHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay notas registradas para este paciente.
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {sortedHistory.map((record: IClinicalRecord, index: number) => (
                  <div key={index} className="relative flex items-start group is-active">
                    {/* Timeline Marker */}
                    <div className="absolute left-0 ml-5 -translate-x-1/2 md:ml-0 md:relative md:left-auto md:translate-x-0 flex items-center justify-center w-auto h-full pr-6 sm:pr-8">
                       <div className="w-4 h-4 rounded-full bg-blue-500 shadow ring-4 ring-white"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 ml-8 md:ml-0 bg-slate-50 rounded-lg border border-slate-200 p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                         <div className="flex items-center gap-2">
                          {record.diagnostico && (
                              <span className="font-bold text-blue-900 text-md">
                              {record.diagnostico}
                              </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {moment(record.fecha).format('LLL')}
                          </span>
                          {record._id && (
                            /* Print Prescription Button */
                            <Link href={`/dashboard/print/receta/${record._id}`} target="_blank">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Imprimir Receta">
                                <Printer className="h-4 w-4 text-slate-600" />
                                <span className="sr-only">Imprimir</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="text-slate-700 whitespace-pre-wrap">
                        {record.nota}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
