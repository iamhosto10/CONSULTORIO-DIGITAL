'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerPayment } from '@/actions/finance-actions';
import { toast } from 'sonner';
import { DollarSign, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  defaultAmount?: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  appointmentId,
  defaultAmount = 0,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Registrar Pago
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pl-8"
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
                <SelectItem value="efectivo">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Efectivo
                  </div>
                </SelectItem>
                <SelectItem value="tarjeta">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Tarjeta
                  </div>
                </SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
