'use client';
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getPublicAvailability, bookPublicAppointment } from '@/actions/public-booking-actions';

moment.locale('es');
const localizer = momentLocalizer(moment);

export default function PublicCalendar({ professionalId }: { professionalId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const fetchAvailability = async () => {
      try {
        const data = await getPublicAvailability(professionalId);
        // Mapear fechas de string a Date object
        const formatted = data.map((evt: any) => ({
            ...evt,
            start: new Date(evt.start),
            end: new Date(evt.end),
            title: 'Ocupado'
        }));
        setEvents(formatted);
      } catch (error) {
          console.error("Error fetching availability", error);
      }
  };

  useEffect(() => {
    fetchAvailability();
  }, [professionalId]);

  const handleSelectSlot = (slotInfo: any) => {
    // Validar que no sea una fecha pasada
    if (slotInfo.start < new Date()) {
        alert("No puedes agendar en el pasado.");
        return;
    }

    // Check for overlap with existing events (client side check for better UX)
    const hasOverlap = events.some(
        (event) =>
          (event.start < slotInfo.end && event.end > slotInfo.start)
      );

    if (hasOverlap) {
        // Optional: Alert user or just ignore
        return;
    }

    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  const handleBooking = async (formData: FormData) => {
      const result = await bookPublicAppointment(formData);
      if (result.success) {
          alert("Cita reservada con éxito. Revisa tu correo.");
          setShowModal(false);
          fetchAvailability(); // Refresh availability
      } else {
          alert(result.message || "Error al reservar");
      }
  };

  return (
    <div className="h-[600px] bg-white p-4 rounded-lg shadow">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }} // Altura explícita crítica
        selectable={true} // CRÍTICO
        onSelectSlot={handleSelectSlot}
        defaultView="week"
        views={['week', 'day']}
        min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
        max={new Date(0, 0, 0, 18, 0, 0)} // 6:00 PM
        eventPropGetter={() => ({
            className: 'bg-gray-400 text-white cursor-not-allowed opacity-75',
        })}
        messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay citas en este rango',
        }}
      />

      {/* Renderiza aquí tu Modal condicionalmente */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-xl w-96">
                  <h3 className="text-xl font-bold mb-4">Reservar Cita</h3>
                  <form action={handleBooking} className="flex flex-col gap-3">
                      {/* Inputs ocultos para las fechas */}
                      <input type="hidden" name="professionalId" value={professionalId} />
                      <input type="hidden" name="fechaInicio" value={selectedSlot?.start.toISOString()} />
                      <input type="hidden" name="fechaFin" value={selectedSlot?.end.toISOString()} />

                      <input name="nombre" placeholder="Tu Nombre" required className="border p-2 rounded" />
                      <input name="email" type="email" placeholder="Tu Email" required className="border p-2 rounded" />
                      <input name="telefono" placeholder="Tu Teléfono" required className="border p-2 rounded" />

                      <div className="flex gap-2 justify-end mt-4">
                          <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Confirmar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
