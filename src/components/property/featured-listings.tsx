import type { Property } from '@/lib/types';
import { PropertyCard } from './property-card';

interface FeaturedListingsProps {
  properties: Property[];
}

export function FeaturedListings({ properties }: FeaturedListingsProps) {
  const featuredProperties = properties.filter(p => p.isFeatured).slice(0, 3); // Show max 3 featured

  if (featuredProperties.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-secondary/50">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
