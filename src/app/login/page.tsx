'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full"
    >
      {pending ? 'Cargando...' : 'Ingresar'}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
             <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Stethoscope className="h-8 w-8 text-primary" />
             </div>
             <h1 className="text-3xl font-bold text-primary">Consultorio Digital</h1>
        </div>

        <Card className="border-slate-200 shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Acceso Profesional</CardTitle>
                <CardDescription className="text-center">
                  Ingresa tus credenciales para acceder al dashboard
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="doctor@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      name="password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div aria-live="polite" aria-atomic="true">
                    {errorMessage && (
                      <p className="text-sm font-medium text-red-500 text-center">{errorMessage}</p>
                    )}
                  </div>
                  <LoginButton />
                </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
