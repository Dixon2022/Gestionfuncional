
'use client';

import { FeaturedListings } from '@/components/property/featured-listings';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, ArrowRight, Home as HomeIcon, Building, LandPlot, Building2 as Building2Icon, Hotel } from 'lucide-react';
import { getProperties, subscribeToProperties } from '@/lib/property-store';
import { useEffect, useState } from 'react';
import type { Property, PropertyType } from '@/lib/types';
import { PROPERTY_TYPES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to get an icon for each property type
const getPropertyTypeIcon = (type: PropertyType) => {
  switch (type) {
    case 'Casa':
      return <HomeIcon className="mr-2 h-4 w-4" />;
    case 'Apartamento':
      return <Building className="mr-2 h-4 w-4" />;
    case 'Condominio':
      return <Building2Icon className="mr-2 h-4 w-4" />;
    case 'Adosado':
      return <Hotel className="mr-2 h-4 w-4" />;
    case 'Terreno':
      return <LandPlot className="mr-2 h-4 w-4" />;
    default:
      return <HomeIcon className="mr-2 h-4 w-4" />;
  }
};

// Helper for basic Spanish pluralization
const pluralizePropertyType = (type: PropertyType, count: number): string => {
  if (count === 1) return type;
  switch (type) {
    case 'Casa': return 'Casas';
    case 'Apartamento': return 'Apartamentos';
    case 'Condominio': return 'Condominios';
    case 'Adosado': return 'Adosados';
    case 'Terreno': return 'Terrenos';
    default: return `${type}s`;
  }
};

export default function HomePage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [propertyCounts, setPropertyCounts] = useState<Record<PropertyType, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProperties((updatedProperties) => {
      setAllProperties(updatedProperties);

      const counts = updatedProperties.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
      }, {} as Record<PropertyType, number>);
      setPropertyCounts(counts);
      
      setIsLoading(false);
    });

    // Initial fetch
    const initialProps = getProperties();
    setAllProperties(initialProps);
    const initialCounts = initialProps.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<PropertyType, number>);
    setPropertyCounts(initialCounts);
    setIsLoading(false);

    return () => unsubscribe();
  }, []);


  return (
    <>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Encuentra la Propiedad de Tus Sueños
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Descubre una amplia gama de propiedades con PropVerse. Búsqueda avanzada, listados detallados e información potenciada por IA.
          </p>
          <div className="flex justify-center">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/properties">
                <Search className="mr-2 h-5 w-5" />
                Explorar Propiedades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Property Type Filter Buttons Section */}
      <section className="py-8 md:py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6 text-center">Explora por Tipo de Propiedad</h2>
          {isLoading || !propertyCounts ? (
             <div className="flex flex-wrap justify-center gap-3">
                {PROPERTY_TYPES.map(type => (
                    <Skeleton key={type} className="h-10 w-32 rounded-md" />
                ))}
             </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {PROPERTY_TYPES.map(type => {
                const count = propertyCounts[type] || 0;
                if (count > 0) {
                  return (
                    <Button key={type} variant="outline" size="lg" asChild>
                      <Link href={`/properties?propertyType=${encodeURIComponent(type)}`}>
                        {getPropertyTypeIcon(type)}
                        {count} {pluralizePropertyType(type, count)}
                      </Link>
                    </Button>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Listings Section */}
      {!isLoading && <FeaturedListings properties={allProperties} />}

      {/* AI Description Generator CTA Section */}
      <section className="py-12">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para Vender o Alquilar?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Aprovecha nuestra IA para crear descripciones de propiedades atractivas que atraigan compradores o inquilinos.
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link href="/generate-description">
              Generar Descripción con IA
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
