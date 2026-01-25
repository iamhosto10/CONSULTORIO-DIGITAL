'use client';

import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface SerializedAppointment {
  _id: string;
  patientId?: {
    nombre: string;
  };
  fechaInicio: string;
  fechaFin: string;
  // Allow other properties if needed for the resource
  [key: string]: unknown;
}

interface CalendarProps {
  appointments: SerializedAppointment[];
}

export default function Calendar({ appointments }: CalendarProps) {
  const events = appointments.map((appointment) => ({
    title: appointment.patientId?.nombre || 'Cita Reservada',
    start: new Date(appointment.fechaInicio),
    end: new Date(appointment.fechaFin),
    resource: appointment,
  }));

  return (
    <div style={{ height: '100%' }}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="week"
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 18, 0, 0)}
        selectable
        onSelectSlot={(slotInfo) => console.log('Abrir modal en:', slotInfo)}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay citas en este rango",
        }}
      />
    </div>
  );
}
