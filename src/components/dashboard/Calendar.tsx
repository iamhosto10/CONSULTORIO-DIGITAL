'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo, useState } from 'react';
import CreateAppointmentModal from './CreateAppointmentModal';
import AppointmentDetailsModal from './AppointmentDetailsModal';

// Configure moment locale
moment.locale('es');

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  appointments: any[];
  patients: any[];
}

const CalendarView = ({ appointments, patients }: CalendarViewProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  const selectedAppointment = useMemo(
    () => appointments.find((apt) => apt._id === selectedAppointmentId),
    [appointments, selectedAppointmentId]
  );

  const events = useMemo(() => {
    return appointments.map((apt) => ({
      title: apt.patientId?.nombre || 'Cita Reservada',
      start: new Date(apt.fechaInicio),
      end: new Date(apt.fechaFin),
      resource: apt,
    }));
  }, [appointments]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedAppointmentId(event.resource._id);
  };

  return (
    <div style={{ height: '100%' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="week"
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 18, 0, 0)}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        messages={{
          next: 'Siguiente',
          previous: 'Anterior',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          agenda: 'Agenda',
          date: 'Fecha',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'No hay eventos en este rango',
        }}
        eventPropGetter={(event) => {
          const isPaid = event.resource.payment?.status === 'pagado';
          return {
            style: {
              backgroundColor: isPaid ? '#22c55e' : '#eab308', // green-500 : yellow-500
              color: 'white',
            },
          };
        }}
      />
      <CreateAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedSlot={selectedSlot}
        patients={patients}
      />
      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointmentId(null)}
        appointment={selectedAppointment}
      />
    </div>
  );
};

export default CalendarView;
