'use client';

import { useState } from 'react';
import CreatePatientModal from './CreatePatientModal';
import { Plus } from 'lucide-react';

export default function PatientsHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex w-full items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Mis Pacientes</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden md:block">Nuevo Paciente</span>
        <span className="md:hidden">Nuevo</span>
      </button>

      <CreatePatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
