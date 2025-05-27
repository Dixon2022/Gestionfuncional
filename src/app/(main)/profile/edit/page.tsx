
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react'; // Import useSession
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UserCircle2, Phone, Mail } from 'lucide-react'; // Added Mail icon

const profileSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }), 
  phone: z.string().min(8, { message: 'El número de teléfono debe tener al menos 8 caracteres.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession(); // Added updateSession
  const user = session?.user as any; // Cast to any to access custom properties like phone
  const authLoading = status === 'loading';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // No longer need isClient for this logic, status handles it.

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/profile/edit');
    }
    if (status === 'authenticated' && user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '', // Assuming phone is part of your session user object
      });
    }
  }, [status, user, router, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    // TODO: Implement API call to update user profile in the database
    // For now, we'll simulate the update and update the session client-side
    // In a real app, you'd call your backend, then on success, call updateSession()
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      // Call Next-Auth's update function to refresh the session
      // This is for client-side session update. For full update, backend must be called
      // and then potentially a new session fetched or the current one updated based on API response.
      await updateSession({ 
        ...session, 
        user: { 
          ...session?.user, 
          name: data.name, 
          email: data.email, 
          // phone: data.phone // If you add phone to JWT and session
        } 
      });

      // If your [...nextauth]/route.ts `jwt` and `session` callbacks are set up
      // to include `phone`, and your `authorize` function returns it,
      // and you have an API endpoint that updates the user in the DB,
      // then calling `updateSession()` or simply `getSession()` again would refresh it.
      // For now, we'll just show a toast as if it worked.
      // A proper implementation would be:
      // const response = await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) });
      // if (response.ok) {
      //   await updateSession(); // or getSession() to refetch
      //   toast({ title: '¡Perfil Actualizado!' ... });
      //   router.push('/profile');
      // } else { /* handle error */ }


      toast({
        title: '¡Perfil Actualizado!',
        description: 'Tu información de perfil ha sido guardada (simulado).',
      });
      router.push('/profile');
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading || status === 'unauthenticated') { // Show loader if loading or if unauthenticated
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      description: 'Tu información de perfil ha sido guardada.',
    });
    router.push('/profile');
    setIsLoading(false);
  };
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  // If authenticated and not loading, render the page
  return (
    <div className="container py-8 md:py-12">
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <UserCircle2 className="mr-2 h-6 w-6 text-primary" />
            Editar Perfil
          </CardTitle>
          <CardDescription>Actualiza tu información personal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                disabled={isLoading} // Email is now editable
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ej: 88887777"
                {...form.register('phone')}
                disabled={isLoading}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
