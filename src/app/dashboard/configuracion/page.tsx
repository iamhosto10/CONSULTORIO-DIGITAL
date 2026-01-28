'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAvailability, updateAvailability } from '@/actions/availability-actions';
import { IAvailability, IDayAvailability } from '@/models/User';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ExternalLink } from 'lucide-react';

const dayNames: Record<keyof IAvailability, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const dayOrder: (keyof IAvailability)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ConfigurationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<IAvailability | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAvailability();
        setAvailability(data.availability);
        setUserId(data.userId);
      } catch (error) {
        toast.error('Error al cargar la configuración');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDayChange = (day: keyof IAvailability, field: keyof IDayAvailability, value: any) => {
    if (!availability) return;
    setAvailability({
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!availability) return;
    setSaving(true);
    try {
      const res = await updateAvailability(availability);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Error al guardar');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!availability) {
    return <div className="text-center text-red-500">No se pudo cargar la configuración.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">Administra tus horarios y disponibilidad.</p>
      </div>

      {userId && (
        <Card>
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-lg">Tu Perfil Público</h3>
              <p className="text-sm text-muted-foreground">Comparte este enlace con tus pacientes para que agenden citas.</p>
            </div>
            <Button variant="outline" asChild>
              <a href={`/p/${userId}`} target="_blank" rel="noopener noreferrer">
                Ver Perfil <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Horario Laboral</CardTitle>
          <CardDescription>
            Define los días y horas en los que estás disponible para recibir citas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {dayOrder.map((day) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Switch
                  checked={availability[day].active}
                  onCheckedChange={(checked) => handleDayChange(day, 'active', checked)}
                  id={`switch-${day}`}
                />
                <Label htmlFor={`switch-${day}`} className="text-base font-medium capitalize w-24 cursor-pointer">
                  {dayNames[day]}
                </Label>
              </div>

              {availability[day].active && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`start-${day}`} className="sr-only">Inicio</Label>
                    <Input
                      id={`start-${day}`}
                      type="time"
                      value={availability[day].start}
                      onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`end-${day}`} className="sr-only">Fin</Label>
                    <Input
                      id={`end-${day}`}
                      type="time"
                      value={availability[day].end}
                      onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
               {!availability[day].active && (
                   <span className="text-sm text-muted-foreground italic sm:w-[276px] text-center sm:text-left">
                       No disponible
                   </span>
               )}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
