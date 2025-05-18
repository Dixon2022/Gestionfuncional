
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { PropertyDetailsView } from '@/components/property/property-details-view';
import { getPropertyById } from '@/lib/property-store';
import type { Property } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : undefined;
  
  const [property, setProperty] = useState<Property | null | undefined>(undefined); // undefined initially, null if not found
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchedProperty = getPropertyById(id);
      setProperty(fetchedProperty || null); // Set to null if not found after fetch
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setProperty(null); // No ID, so not found
    }
  }, [id]);

  useEffect(() => {
    if (property && property.title) {
      document.title = `${property.title} - PropVerse`;
    } else if (property === null && !isLoading) {
      document.title = 'Propiedad No Encontrada - PropVerse';
    }
  }, [property, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando propiedad...</span>
      </div>
    );
  }

  if (property === null) {
    // Programmatic notFound() is not available in client components in the same way.
    // Instead, we render a not found UI or redirect.
    // For consistency with the original not-found.tsx, we can redirect or show a similar UI.
    // router.replace('/404') or render a dedicated component.
    // For now, let's use the error.tsx as a template for a simple not-found message.
     return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Propiedad no encontrada</h2>
        <p className="text-muted-foreground mb-6">
          La propiedad que buscas no existe o no está disponible.
        </p>
        <Button onClick={() => router.push('/properties')}>Volver a Propiedades</Button>
      </div>
    );
  }
  
  if (!property) {
    // This case should ideally be covered by isLoading or property === null
    // It's a fallback, could also render a generic error or redirect.
    return (
         <div className="container py-12 text-center">
            <p>Cargando datos de la propiedad...</p>
         </div>
    );
  }

  return <PropertyDetailsView property={property} />;
}
