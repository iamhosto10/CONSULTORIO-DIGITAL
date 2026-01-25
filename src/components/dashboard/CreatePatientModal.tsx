'use client';

import { createPatient } from '@/actions/patientActions';
import { useActionState } from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialState = {
  success: false,
  message: '',
  errors: undefined,
};

export default function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
  // @ts-ignore - Types for useActionState might be slightly different in current React 19 RC/Beta vs final, suppressing potential type mismatch for now if strict
  const [state, action, isPending] = useActionState(createPatient, initialState);

  // Reset form when modal opens? Or just when success happens?
  // We can use a key or refs to reset, or just let the form be rebuilt.
  // Actually, standard <form action={action}> handles it.

  useEffect(() => {
    if (state?.success) {
      // Small delay or immediate close?
      const timer = setTimeout(() => {
        onClose();
        // Ideally reset state, but useActionState doesn't expose reset easily without a wrapper or key change.
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Registrar Nuevo Paciente</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={action} className="p-4 space-y-4">
          {state?.success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 border border-green-200">
              {state.message}
            </div>
          )}

          {!state?.success && state?.message && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {state.message}
            </div>
          )}

          <div>
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-700">
              Cédula
            </label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej. 1234567890"
            />
            {state?.errors?.cedula && (
              <p className="mt-1 text-xs text-red-500">{state.errors.cedula[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej. Juan Pérez"
            />
            {state?.errors?.nombre && (
              <p className="mt-1 text-xs text-red-500">{state.errors.nombre[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="juan@ejemplo.com"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-500">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0991234567"
            />
            {state?.errors?.telefono && (
              <p className="mt-1 text-xs text-red-500">{state.errors.telefono[0]}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || state?.success}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
