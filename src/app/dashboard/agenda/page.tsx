import { getAppointments } from '@/actions/appointmentActions';
import CalendarView from '@/components/dashboard/Calendar';

export default async function AgendaPage() {
  const now = new Date();
  // Fetch appointments for a broad range (e.g., current month +/- 1 month)
  // This is a basic implementation. Ideally, the calendar should fetch on demand as the user navigates.
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const appointments = await getAppointments(start, end);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
      <div className="bg-white shadow rounded-lg p-4 h-[600px]">
        <CalendarView appointments={appointments} />
      </div>
    </div>
  );
}
