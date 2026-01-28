import React from 'react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

interface PrescriptionTemplateProps {
  doctor: {
    nombre: string;
    especialidad: string;
    registroMedico: string;
    email: string;
  };
  patient: {
    nombre: string;
    cedula: string;
  };
  note: {
    fecha: Date | string;
    diagnostico?: string;
    nota: string;
  };
}

export default function PrescriptionTemplate({ doctor, patient, note }: PrescriptionTemplateProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 max-w-3xl mx-auto print:p-0 print:max-w-none">
       <style>{`
        @media print {
          @page {
            margin: 20mm;
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <header className="text-center space-y-2 mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
          {doctor.nombre}
        </h1>
        <div className="text-sm text-slate-600 flex flex-col items-center gap-1">
          <span className="font-medium text-slate-700">{doctor.especialidad}</span>
          <div className="flex items-center gap-2">
            <span>Reg: {doctor.registroMedico}</span>
            <span>•</span>
            <span>{doctor.email}</span>
          </div>
        </div>
      </header>

      {/* Patient Info */}
      <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-md border border-slate-100 print:bg-transparent print:border-none print:p-0">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Paciente</p>
          <p className="text-lg font-medium">{patient.nombre}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Cédula</p>
          <p className="text-base font-medium">{patient.cedula}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold">Fecha</p>
          <p className="text-base font-medium capitalize">
            {moment(note.fecha).format('LL')}
          </p>
        </div>
      </div>

      {/* Body / Rx */}
      <main className="space-y-8 min-h-[300px]">
        {note.diagnostico && (
            <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-slate-900 pl-2">
                Diagnóstico
            </h3>
            <p className="text-base text-slate-800 leading-relaxed">
                {note.diagnostico}
            </p>
            </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-slate-900 pl-2">
            Tratamiento / Rx
          </h3>
          <div className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
            {note.nota}
          </div>
        </div>
      </main>

      {/* Footer / Signature */}
      <footer className="mt-16 pt-8">
        <div className="flex justify-end">
          <div className="w-64 text-center">
            <div className="h-16 border-b border-slate-900 mb-2"></div>
            <p className="font-bold text-sm text-slate-900">{doctor.nombre}</p>
            <p className="text-xs text-slate-600">{doctor.especialidad}</p>
            <p className="text-xs text-slate-600">Reg: {doctor.registroMedico}</p>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-slate-400 print:block hidden">
          Generado el {moment().format('LLL')}
        </div>
      </footer>
    </div>
  );
}
