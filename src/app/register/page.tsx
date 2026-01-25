'use client';

import { useActionState } from 'react';
import { registerUser } from '@/actions/register-action';
import Link from 'next/link';

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerUser, {
    message: '',
    errors: {},
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear una cuenta nueva
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Registro para Profesionales de la Salud
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form action={action} className="space-y-6">

            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre Completo
              </label>
              <div className="mt-1">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              {state.errors?.nombre && (
                <p className="mt-2 text-sm text-red-600" id="nombre-error">
                  {state.errors.nombre[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              {state.errors?.email && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              {state.errors?.password && (
                <p className="mt-2 text-sm text-red-600" id="password-error">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Especialidad */}
            <div>
              <label htmlFor="especialidad" className="block text-sm font-medium text-gray-700">
                Especialidad
              </label>
              <div className="mt-1">
                <input
                  id="especialidad"
                  name="especialidad"
                  type="text"
                  placeholder="Ej: Cardiología"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              {state.errors?.especialidad && (
                <p className="mt-2 text-sm text-red-600" id="especialidad-error">
                  {state.errors.especialidad[0]}
                </p>
              )}
            </div>

            {/* Registro Médico */}
            <div>
              <label htmlFor="registroMedico" className="block text-sm font-medium text-gray-700">
                Registro Médico / Tarjeta Profesional
              </label>
              <div className="mt-1">
                <input
                  id="registroMedico"
                  name="registroMedico"
                  type="text"
                  required
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              {state.errors?.registroMedico && (
                <p className="mt-2 text-sm text-red-600" id="registroMedico-error">
                  {state.errors.registroMedico[0]}
                </p>
              )}
            </div>

            {/* General Error Message */}
            {state.message && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error en el registro
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{state.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  O
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center text-sm">
              <span className="px-2 text-gray-500">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Inicia sesión
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
