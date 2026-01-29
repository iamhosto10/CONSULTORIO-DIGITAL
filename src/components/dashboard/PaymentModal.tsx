'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { registerPayment } from '@/actions/finance-actions';
import { toast } from 'sonner';
import { DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  defaultAmount?: number;
  patientName?: string;
  date?: Date;
}

export default function PaymentModal({
  isOpen,
  onClose,
  appointmentId,
  defaultAmount = 0,
  patientName = 'Paciente Desconocido',
  date = new Date(),
}: PaymentModalProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [method, setMethod] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(defaultAmount);
      setMethod('efectivo');
    }
  }, [isOpen, defaultAmount]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await registerPayment(appointmentId, amount, method);
      if (result.success) {
        toast.success('Pago registrado correctamente');
        onClose();
      } else {
        toast.error(result.message || 'Error al registrar el pago');
      }
    } catch (error) {
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Registrar Pago
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
            <div className="flex flex-col space-y-1 mb-4">
                <span className="text-sm font-medium">{patientName}</span>
                <span className="text-xs text-muted-foreground capitalize">
                    {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                </span>
            </div>

            <Separator className="my-4" />

          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Monto a Cobrar</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="pl-9 text-lg font-medium"
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método de Pago</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
            variant="default"
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
