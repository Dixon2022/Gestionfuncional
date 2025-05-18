'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Mail, Edit3, LogOut } from 'lucide-react';
import type { Metadata } from 'next';
import { getProperties } from '@/lib/property-store';
import type { Property } from '@/lib/types';
import { PropertyCard } from '@/components/property/property-card';

// Cannot define metadata in client component, so we define it statically or handle dynamically if needed.
// export const metadata: Metadata = {
//   title: 'Mi Perfil - PropVerse',
//   description: 'Administra tu información y propiedades en PropVerse.',
// };


export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const allProps = getProperties();
      setMyProperties(allProps.filter(p => p.ownerId === user.id));
    }
  }, [user]);


  if (loading || !isClient) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando perfil...</span>
      </div>
    );
  }

  if (!user) {
     // This should ideally be caught by the useEffect redirect, but as a fallback
    return (
        <div className="container py-8 text-center">
            <p>Debes iniciar sesión para ver esta página.</p>
            <Button onClick={() => router.push('/login')} className="mt-4">Iniciar Sesión</Button>
        </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-24 w-24 mb-4">
            {/* Placeholder for user avatar if available */}
            <AvatarFallback className="text-3xl">
              <UserCircle className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{user.name || 'Usuario'}</CardTitle>
          <CardDescription className="flex items-center justify-center text-md">
            <Mail className="mr-2 h-4 w-4" /> {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
            <Button variant="destructive" onClick={() => { logout(); router.push('/'); }}>
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Mis Propiedades Publicadas</h2>
            {myProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">
                Aún no has publicado ninguna propiedad.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

