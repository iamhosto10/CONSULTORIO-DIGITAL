'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import PaymentModal from './PaymentModal';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
}

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
}: AppointmentDetailsModalProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (!appointment) return null;

  const isPaid = appointment.payment?.status === 'pagado';
  const amount = isPaid ? appointment.payment.amount : (appointment.costo || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Paciente:</span>
              <span className="col-span-3">{appointment.patientId?.nombre || 'Desconocido'}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Fecha:</span>
              <span className="col-span-3 capitalize">
                {format(new Date(appointment.fechaInicio), "EEEE, d 'de' MMMM", { locale: es })}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Hora:</span>
              <span className="col-span-3">
                {format(new Date(appointment.fechaInicio), 'HH:mm')} - {format(new Date(appointment.fechaFin), 'HH:mm')}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-bold text-right">Estado:</span>
              <div className="col-span-3">
                {isPaid ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Pagado: {formatCurrency(amount)}
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
                    Pendiente
                  </Badge>
                )}
              </div>
            </div>
             {appointment.notas && (
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-bold text-right mt-1">Notas:</span>
                <p className="col-span-3 text-sm text-gray-500">{appointment.notas}</p>
              </div>
            )}
          </div>

          <DialogFooter>
             <Button variant="outline" onClick={onClose}>Cerrar</Button>
            {!isPaid && (
              <Button onClick={() => setShowPaymentModal(true)} className="bg-blue-600 hover:bg-blue-700">
                Cobrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
        }}
        appointmentId={appointment._id}
        defaultAmount={appointment.costo}
      />
    </>
  );
}
