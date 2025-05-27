'use client';

import { GenerateDescriptionForm } from '@/components/ai/generate-description-form';
import { useSession } from 'next-auth/react'; // Import useSession
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

// Static metadata for the page
// export const metadata: Metadata = {
//   title: 'Generador de Descripciones de Propiedades con IA - PropVerse',
//   description: 'Genera descripciones de propiedades atractivas usando IA. Ingresa los detalles de la propiedad y deja que nuestra IA cree el texto perfecto para tu listado.',
// };


export default function GenerateDescriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;
  const isLoading = status === 'loading';
  // No longer need isClient for this logic, status handles it.

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/generate-description');
    }
  }, [status, router]);
  
  if (isLoading || status === 'unauthenticated') { // Show loader if loading or if unauthenticated (before redirect kicks in)
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  // If authenticated and not loading, render the page
  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">Generador de Descripciones de Propiedades con IA</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
          Crea descripciones de propiedades atractivas sin esfuerzo. Proporciona algunos detalles y deja que nuestra IA haga el resto.
        </p>
      </div>
      <GenerateDescriptionForm />
    </div>
  );
}

