'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PropertyDetailsPage } from '@/components/property/property-details-view';
import { getPropertyById } from '@/lib/property-store';
import type { Property } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function useProperty(id?: string) {
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        const fetchedProperty = await getPropertyById(id);
        setProperty(
          fetchedProperty
            ? { 
                ...fetchedProperty, 
                images: fetchedProperty.images as (string | { url: string })[] 
              }
            : null
        );
        setIsLoading(false);
      } else {
        setProperty(null);
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);
  console.log('useProperty', { id, property, isLoading });
  return { property, isLoading };
}

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const { property, isLoading } = useProperty(id);

  useEffect(() => {
    if (property && property.title) {
      document.title = `${property.title} - FindHome`;
    } else if (property === null && !isLoading) {
      document.title = 'Propiedad No Encontrada - FindHome';
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
    return (
      <div className="container py-12 text-center">
        <p>Cargando datos de la propiedad...</p>
      </div>
    );
  }

  return (
    <div>
      <PropertyDetailsPage propertyId={property.id} />
    </div>
  );
}
