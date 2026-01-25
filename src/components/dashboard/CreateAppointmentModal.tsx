'use client';

import { createAppointment } from '@/actions/appointmentActions';
import { useActionState } from 'react';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import moment from 'moment';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { start: Date; end: Date } | null;
  patients: any[];
}

const initialState = {
  success: false,
  message: '',
  errors: undefined,
};

export default function CreateAppointmentModal({
  isOpen,
  onClose,
  selectedSlot,
  patients,
}: CreateAppointmentModalProps) {
  const [state, action, isPending] = useActionState(createAppointment, initialState);

  // State for inputs to manage ISO conversion
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // Update state when selectedSlot changes or modal opens
  useEffect(() => {
    if (selectedSlot) {
      setStart(moment(selectedSlot.start).format('YYYY-MM-DDTHH:mm'));
      setEnd(moment(selectedSlot.end).format('YYYY-MM-DDTHH:mm'));
    }
  }, [selectedSlot, isOpen]);

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        onClose();
        // Reset or rely on parent closing
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  if (!isOpen) return null;

  // Calculate ISO strings for hidden inputs
  // moment(start) uses local timezone. .toISOString() converts to UTC.
  const startISO = start ? moment(start).toISOString() : '';
  const endISO = end ? moment(end).toISOString() : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">Nueva Cita</h2>
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
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
              Paciente
            </label>
            <select
              id="patientId"
              name="patientId"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Seleccionar paciente
              </option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            {state?.errors?.patientId && (
              <p className="mt-1 text-xs text-red-500">{state.errors.patientId[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startInput" className="block text-sm font-medium text-gray-700">
                Inicio
              </label>
              <input
                type="datetime-local"
                id="startInput"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input type="hidden" name="fechaInicio" value={startISO} />
              {state?.errors?.fechaInicio && (
                <p className="mt-1 text-xs text-red-500">{state.errors.fechaInicio[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="endInput" className="block text-sm font-medium text-gray-700">
                Fin
              </label>
              <input
                type="datetime-local"
                id="endInput"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input type="hidden" name="fechaFin" value={endISO} />
              {state?.errors?.fechaFin && (
                <p className="mt-1 text-xs text-red-500">{state.errors.fechaFin[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
              Notas <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {state?.errors?.notas && (
              <p className="mt-1 text-xs text-red-500">{state.errors.notas[0]}</p>
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
