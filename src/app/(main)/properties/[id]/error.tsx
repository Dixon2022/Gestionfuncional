'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-12 text-center">
      <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-semibold mb-4">¡Ups! Algo salió mal.</h2>
      <p className="text-muted-foreground mb-6">
        Encontramos un error al intentar cargar esta propiedad. Por favor, inténtalo de nuevo más tarde.
      </p>
      <div className="space-x-4">
        <Button onClick={() => reset()} variant="outline">
          Intentar de nuevo
        </Button>
        <Button asChild>
          <Link href="/properties">Volver a Propiedades</Link>
        </Button>
      </div>
    </div>
  );
}
