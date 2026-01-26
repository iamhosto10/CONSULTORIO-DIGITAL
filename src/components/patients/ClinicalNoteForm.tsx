'use client';

import { useActionState } from 'react';
import { addClinicalNote } from '@/actions/clinical-actions';
import { Save } from 'lucide-react';

type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const initialState: ActionState = {
  success: false,
  message: '',
  errors: {},
};

export default function ClinicalNoteForm({ patientId }: { patientId: string }) {
  const [state, action, isPending] = useActionState(
    addClinicalNote.bind(null, patientId),
    initialState
  );

  return (
    <form
      action={action}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Nueva Evolución
      </h3>

      {state.message && (
        <div
          className={`p-3 rounded text-sm mb-4 ${
            state.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="diagnostico"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Diagnóstico
        </label>
        <input
          type="text"
          id="diagnostico"
          name="diagnostico"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Hipertensión Arterial"
        />
        {state.errors?.diagnostico && (
          <p className="mt-1 text-sm text-red-600">{state.errors.diagnostico}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="nota"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Evolución / Nota <span className="text-red-500">*</span>
        </label>
        <textarea
          id="nota"
          name="nota"
          rows={4}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Escriba la nota de evolución aquí..."
        ></textarea>
        {state.errors?.nota && (
          <p className="mt-1 text-sm text-red-600">{state.errors.nota}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Guardando...' : 'Guardar Evolución'}
        </button>
      </div>
    </form>
  );
}
