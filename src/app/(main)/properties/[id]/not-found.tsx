import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center py-12">
      <SearchX className="h-20 w-20 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">Propiedad No Encontrada</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Lo sentimos, no pudimos encontrar la propiedad que estás buscando. Podría haber sido movida o ya no estar disponible.
      </p>
      <Button asChild size="lg">
        <Link href="/properties">Ver Todas las Propiedades</Link>
      </Button>
    </div>
  );
}
