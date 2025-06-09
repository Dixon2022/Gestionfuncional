import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';

interface FeaturedListingsProps {
  properties: Property[];
}

export function FeaturedListings({ properties }: FeaturedListingsProps) {
  if (properties.length === 0) {
    return null;
  }

  // Ordenar de más reciente a más antiguo
  const sortedProperties = properties
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );

  return (
    <section className="py-12 bg-secondary/50">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 text-center">Propiedades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
