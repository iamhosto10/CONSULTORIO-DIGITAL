'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from 'react';

// Configure moment locale
moment.locale('es');

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  appointments: any[];
}

const CalendarView = ({ appointments }: CalendarViewProps) => {
  const events = useMemo(() => {
    return appointments.map((apt) => ({
      title: apt.patientId?.nombre || 'Cita Reservada',
      start: new Date(apt.fechaInicio),
      end: new Date(apt.fechaFin),
      resource: apt,
    }));
  }, [appointments]);

  const handleSelectSlot = (slotInfo: any) => {
    console.log('Abrir modal en:', slotInfo);
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
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: '#3b82f6', // bg-blue-500
            color: 'white',
          },
        })}
      />
    </div>
  );
};

export default CalendarView;
