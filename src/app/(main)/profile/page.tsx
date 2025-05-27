
'use client';

import { useSession, signOut } from 'next-auth/react'; // Import useSession and signOut
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserCircle, Mail, Edit3, LogOut, PlusCircle, Phone } from 'lucide-react';
import { getProperties, subscribeToProperties } from '@/lib/property-store';
import type { Property } from '@/lib/types';
import { PropertyCard } from '@/components/property/property-card';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any; // Cast to any to access custom properties like id, phone
  const isLoading = status === 'loading';
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  // No longer need isClient for this logic, status handles it.
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && user?.id) {
      const unsubscribe = subscribeToProperties((updatedProperties) => {
        setMyProperties(updatedProperties.filter(p => p.ownerId === user.id));
      });
      // Initial fetch
      const allProps = getProperties();
      setMyProperties(allProps.filter(p => p.ownerId === user.id));
      return () => unsubscribe();
    } else {
      setMyProperties([]); // Clear properties if user is not authenticated or no id
    }
  }, [status, user]);


  if (isLoading || status === 'unauthenticated') { // Show loader if loading or if unauthenticated
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando perfil...</span>
      </div>
    );
  }
  
  // If authenticated and not loading, render the page
  return (
    <div className="container py-8 md:py-12">
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Avatar className="mx-auto h-24 w-24 mb-4 border-2 border-primary">
             <AvatarImage src={user?.name ? `https://placehold.co/100x100.png?text=${user.name.substring(0,1)}` : undefined} alt={user?.name || 'Usuario'} data-ai-hint="avatar persona"/>
            <AvatarFallback className="text-3xl bg-secondary">
              {user?.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle className="h-16 w-16" />}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{user?.name || 'Usuario'}</CardTitle>
          <CardDescription className="flex flex-col items-center justify-center text-md space-y-1">
            <span className="flex items-center"><Mail className="mr-2 h-4 w-4" /> {user?.email}</span>
            {/* Assuming 'phone' is part of your session user object */}
            {user?.phone && <span className="flex items-center"><Phone className="mr-2 h-4 w-4" /> {user.phone}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/profile/edit">
                <Edit3 className="mr-2 h-4 w-4" /> Editar Perfil
              </Link>
            </Button>
            <Button variant="default" asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/generate-description"> {/* Assuming this is the correct link for adding property */}
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Propiedad
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => signOut({ callbackUrl: '/login' })} // Sign out and redirect to login
              className="w-full sm:w-auto"
            >
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Mis Propiedades Publicadas</h2>
            {myProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6 bg-secondary/30 rounded-md">
                Aún no has publicado ninguna propiedad. ¿Por qué no generas una ahora?
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
