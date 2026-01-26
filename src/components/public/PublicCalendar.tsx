'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getPublicAvailability, bookPublicAppointment } from '@/actions/public-booking-actions';
import { Loader2, X, CheckCircle } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  isBusy?: boolean;
}

interface PublicCalendarProps {
  professionalId: string;
}

export default function PublicCalendar({ professionalId }: PublicCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      const availability = await getPublicAvailability(professionalId);
      const busyEvents = availability.map((slot: { start: string | Date; end: string | Date }) => ({
        start: new Date(slot.start),
        end: new Date(slot.end),
        title: 'Ocupado',
        isBusy: true,
      }));
      setEvents(busyEvents);
    } catch (error) {
      console.error('Failed to load availability', error);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Prevent selecting past dates
    if (moment(slotInfo.start).isBefore(moment(), 'minute')) {
      return;
    }

    // Check overlap with existing events
    const hasOverlap = events.some(
      (event) =>
        (event.start < slotInfo.end && event.end > slotInfo.start)
    );

    if (hasOverlap) return;

    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setModalOpen(true);
    setMessage(null);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setMessage(null);

    const payload = new FormData();
    payload.append('professionalId', professionalId);
    payload.append('nombre', formData.nombre);
    payload.append('email', formData.email);
    payload.append('telefono', formData.telefono);
    payload.append('fechaInicio', selectedSlot.start.toISOString());
    payload.append('fechaFin', selectedSlot.end.toISOString());

    try {
      const result = await bookPublicAppointment(payload);

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Solicitud enviada' });
        // Wait a bit before closing to show success message
        setTimeout(() => {
          setModalOpen(false);
          setFormData({ nombre: '', email: '', telefono: '' });
          fetchAvailability(); // Refresh to update availability
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al solicitar cita' });
      }
    } catch (error) {
       setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSubmitting(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    if (event.isBusy) {
      return {
        style: {
          backgroundColor: '#d1d5db', // bg-gray-300
          color: '#374151', // text-gray-700
          border: '1px solid #9ca3af',
          cursor: 'not-allowed',
        },
      };
    }
    return {};
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mt-8">
      <div className="h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          views={['week', 'day']}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 20, 0, 0)} // 8:00 PM
          step={30}
          timeslots={2}
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
          culture='es'
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <h3 className="font-bold text-lg text-blue-900">Confirmar Reserva</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {message?.type === 'success' ? (
                 <div className="text-center py-8">
                    <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="text-green-600 w-8 h-8" />
                    </div>
                    <p className="text-xl font-bold text-green-700 mb-2">{message.text}</p>
                    <p className="text-sm text-gray-500">Te hemos enviado un correo con los detalles.</p>
                 </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Fecha:</span> {selectedSlot && moment(selectedSlot.start).format('LL')} <br/>
                      <span className="font-semibold">Hora:</span> {selectedSlot && moment(selectedSlot.start).format('LT')} - {selectedSlot && moment(selectedSlot.end).format('LT')}
                    </p>
                  </div>

                  {message?.type === 'error' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
                      {message.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej. Juan Pérez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej. 099123456"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4"
                  >
                    {submitting ? <Loader2 className="animate-spin mr-2 w-5 h-5" /> : null}
                    {submitting ? 'Procesando...' : 'Confirmar Reserva'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
