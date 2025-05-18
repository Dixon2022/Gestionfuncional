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
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, UserCircle2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor ingresa un email válido.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (isClient && !authLoading && !user) {
      router.push('/login?redirect=/profile/edit');
    }
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user, authLoading, router, form, isClient]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({ name: data.name, email: data.email });
    
    toast({
      title: '¡Perfil Actualizado!',
      description: 'Tu información de perfil ha sido guardada.',
    });
    router.push('/profile');
    setIsLoading(false);
  };
  
  if (authLoading || !isClient) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    return (
         <div className="container py-8 text-center">
            <p>Debes iniciar sesión para editar tu perfil.</p>
            <Button onClick={() => router.push('/login?redirect=/profile/edit')} className="mt-4">Iniciar Sesión</Button>
        </div>
    );
  }

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
                disabled={isLoading} 
                // Consider making email read-only if it's tied to login identity and not changeable
                // For this mock, we allow editing, but it won't change the "login" email.
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            {/* Add password change fields here if needed in the future */}
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
