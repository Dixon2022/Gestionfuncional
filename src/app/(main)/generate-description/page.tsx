'use client';

import { GenerateDescriptionForm } from '@/components/ai/generate-description-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

// Static metadata for the page
// export const metadata: Metadata = {
//   title: 'Generador de Descripciones de Propiedades con - FindHome',
//   description: 'Ingresa los detalles de la propiedad',
// };


export default function GenerateDescriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted
  }, []);

  useEffect(() => {
    if (isClient && !loading && !user) {
      router.push('/login?redirect=/generate-description');
    }
  }, [user, loading, router, isClient]);
  
  if (loading || !isClient) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    // This state should ideally not be reached if redirect works, but serves as fallback.
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-6">
          Debes iniciar sesión para acceder a esta funcionalidad.
        </p>
        <Button onClick={() => router.push('/login?redirect=/generate-description')}>
          Ir a Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Agregar propiedades nuevas</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Agregar propiedades nuevas a tu listado es fácil y rápido. Completa los detalles de la propiedad
        </p>
      </div>
      <GenerateDescriptionForm />
    </div>
  );
}

