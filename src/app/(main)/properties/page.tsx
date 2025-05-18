'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/property/property-card';
import { PropertySearchFilters } from '@/components/property/property-search-filters';
import { MOCK_PROPERTIES } from '@/lib/constants';
import type { Property, SearchFilters } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesPage() {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(() => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      location: params.get('location') || undefined,
      propertyType: params.get('propertyType') as Property['type'] || undefined,
      minPrice: params.get('minPrice') ? parseInt(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseInt(params.get('maxPrice')!) : undefined,
      bedrooms: params.get('bedrooms') ? parseInt(params.get('bedrooms')!) : undefined,
      bathrooms: params.get('bathrooms') ? parseInt(params.get('bathrooms')!) : undefined,
    };
  });

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      let properties = MOCK_PROPERTIES;
      if (currentFilters.location && currentFilters.location !== "any") {
        properties = properties.filter(p => p.city.toLowerCase() === currentFilters.location?.toLowerCase());
      }
      if (currentFilters.propertyType && currentFilters.propertyType !== "any" as any) {
        properties = properties.filter(p => p.type === currentFilters.propertyType);
      }
      if (currentFilters.minPrice) {
        properties = properties.filter(p => p.price >= currentFilters.minPrice!);
      }
      if (currentFilters.maxPrice) {
        properties = properties.filter(p => p.price <= currentFilters.maxPrice!);
      }
      if (currentFilters.bedrooms && currentFilters.bedrooms > 0) {
        properties = properties.filter(p => p.bedrooms >= currentFilters.bedrooms!);
      }
      if (currentFilters.bathrooms && currentFilters.bathrooms > 0) {
        properties = properties.filter(p => p.bathrooms >= currentFilters.bathrooms!);
      }
      setFilteredProperties(properties);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentFilters]);

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
    // Update URL query params without navigation for better UX if desired,
    // or navigate to reflect filters in URL. For now, just local state.
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Find Your Next Property</h1>
      <PropertySearchFilters onSearch={handleSearch} initialFilters={currentFilters} />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-lg py-10">
          No properties match your current filters. Try adjusting your search!
        </p>
      )}
    </div>
  );
}
