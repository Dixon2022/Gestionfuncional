'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { Building2, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth(); // Using login for signup in mock
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    // Simulate API call for registration
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For mock: just log in the user after "signup"
    login(data.email, data.name);
    
    toast({
      title: '¡Cuenta Creada!',
      description: 'Te has registrado e iniciado sesión correctamente.',
    });
    router.push('/');
    setIsLoading(false);
  };

  return (
    <>
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center space-x-2 text-primary mb-4">
          <Building2 className="h-8 w-8" />
          <span className="text-3xl font-bold">PropVerse</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Crear una Cuenta</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus datos para registrarte.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            placeholder="Tu Nombre"
            {...form.register('name')}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@ejemplo.com"
            {...form.register('email')}
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...form.register('password')}
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creando cuenta...' : <> <UserPlus className="mr-2"/> Crear Cuenta </>}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia Sesión
        </Link>
      </p>
    </>
  );
}
