
'use client';

import { FeaturedListings } from '@/components/property/featured-listings';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { getProperties } from '@/lib/property-store';
import { useEffect, useState } from 'react';
import type { Property } from '@/lib/types';

/**
 * @en HomePage component - The main landing page of the application.
 * It displays a hero section, featured property listings, and a call to action
 * for generating AI property descriptions.
 * @es Componente HomePage - La página principal de la aplicación.
 * Muestra una sección de héroe, listados de propiedades destacadas y una llamada a la acción
 * para generar descripciones de propiedades con IA.
 * @returns {JSX.Element} The HomePage component.
 */
export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * @en Effect to fetch properties on component mount.
     * @es Efecto para obtener las propiedades cuando el componente se monta.
     */
    setProperties(getProperties());
    setIsLoading(false);
  }, []);


  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            [EN] Find Your Dream Property [ES] Encuentra la Propiedad de Tus Sueños
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            [EN] Discover a wide range of properties with PropVerse. Advanced search, detailed listings, and AI-powered insights.
            [ES] Descubre una amplia gama de propiedades con PropVerse. Búsqueda avanzada, listados detallados e información potenciada por IA.
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/properties">
                <Search className="mr-2 h-5 w-5" />
                [EN] Explore Properties [ES] Explorar Propiedades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Featured Listings Section */}
      {!isLoading && <FeaturedListings properties={properties} />}

      {/* AI Description Generator CTA Section */}
      <section className="py-12">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            [EN] Ready to Sell? [ES] ¿Listo para Vender?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            [EN] Leverage our AI to create compelling property descriptions that attract buyers.
            [ES] Aprovecha nuestra IA para crear descripciones de propiedades atractivas que atraigan compradores.
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link href="/generate-description">
              [EN] Generate AI Description [ES] Generar Descripción con IA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
