'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import PaymentModal from './PaymentModal';
import { Calendar, DollarSign } from 'lucide-react';

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
            <DialogTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Detalles de la Consulta
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground">Paciente:</Label>
              <span className="col-span-3 font-medium">{appointment.patientId?.nombre || 'Desconocido'}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground">Fecha:</Label>
              <span className="col-span-3 capitalize">
                {format(new Date(appointment.fechaInicio), "EEEE, d 'de' MMMM", { locale: es })}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground">Hora:</Label>
              <span className="col-span-3">
                {format(new Date(appointment.fechaInicio), 'HH:mm')} - {format(new Date(appointment.fechaFin), 'HH:mm')}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground">Estado:</Label>
              <div className="col-span-3">
                {isPaid ? (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    Pagado: {formatCurrency(amount)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Pendiente
                  </Badge>
                )}
              </div>
            </div>
             {appointment.notas && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-muted-foreground mt-1">Notas:</Label>
                <p className="col-span-3 text-sm text-muted-foreground">{appointment.notas}</p>
              </div>
            )}
          </div>

          <DialogFooter>
             <Button variant="outline" onClick={onClose}>Cerrar</Button>
            {!isPaid && (
              <Button onClick={() => setShowPaymentModal(true)} variant="default">
                <DollarSign className="mr-2 h-4 w-4" />
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
        patientName={appointment.patientId?.nombre || 'Desconocido'}
        date={new Date(appointment.fechaInicio)}
      />
    </>
  );
}
