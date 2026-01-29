import { getPatients } from "@/actions/patientActions";
import PatientsHeader from "@/components/dashboard/PatientsHeader";
import Search from "@/components/dashboard/Search";
import { Eye, FileText } from "lucide-react";
import Link from "next/link";

interface Patient {
  _id: string;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
}

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const patients: Patient[] = await getPatients(query);

  return (
    <div className="w-full space-y-6">
      <PatientsHeader />

      <div className="flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar pacientes por nombre o cédula..." />
      </div>

      {patients.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center animate-in fade-in-50">
          <h3 className="text-sm font-semibold text-gray-900">
            No hay pacientes
          </h3>
          <p className="text-sm text-gray-500">
            Comienza registrando un nuevo paciente.
          </p>
        </div>
      ) : (
        <div className="mt-6 flow-root">
          <div className="inline-block min-w-full align-middle">
            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
              {/* Mobile View */}
              <div className="md:hidden">
                {patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="mb-2 w-full rounded-md bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="mb-2 flex items-center">
                          <p className="font-medium">{patient.nombre}</p>
                        </div>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.cedula}
                      </div>
                    </div>
                    <div className="flex w-full items-center justify-between pt-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {patient.telefono}
                        </p>
                      </div>
                      <button className="flex items-center gap-2 rounded-md border p-2 hover:bg-gray-100 text-sm">
                        <FileText className="w-4 h-4" />
                        Historia
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <table className="hidden min-w-full text-gray-900 md:table">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Nombre
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Cédula
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Teléfono
                    </th>
                    <th scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {patients.map((patient) => (
                    <tr
                      key={patient._id}
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{patient.nombre}</p>
                        </div>
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {patient.cedula}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {patient.telefono}
                      </td>
                      <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <button
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                            title="Ver Historia"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="hidden lg:inline">
                              Ver Historia
                            </span>
                          </button>
                          <Link
                            href={`/dashboard/pacientes/${patient._id}`}
                            className="cursor-pointer"
                          >
                            <button
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
                              title="Ver Historia"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden lg:inline">
                                Ver Paciente
                              </span>
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
