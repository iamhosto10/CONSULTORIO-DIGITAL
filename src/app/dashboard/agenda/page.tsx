import { getAppointments } from '@/actions/appointmentActions';
import Calendar from '@/components/dashboard/Calendar';

export default async function AgendaPage() {
  const appointments = await getAppointments();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agenda</h1>
      <div className="h-[600px] bg-white shadow rounded-lg p-4">
        <Calendar appointments={appointments} />
      </div>
    </div>
  );
}
