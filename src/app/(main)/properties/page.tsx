'use client';

import { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/property/property-card';
import { PropertySearchFilters } from '@/components/property/property-search-filters';
import { getProperties } from '@/lib/property-store';
import type { Property, SearchFilters, ListingType } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesPage() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();

  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(() => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      location: params.get('location') || undefined,
      propertyType: params.get('propertyType') as Property['type'] || undefined,
      listingType: params.get('listingType') as ListingType || undefined,
      minPrice: params.get('minPrice') ? parseInt(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseInt(params.get('maxPrice')!) : undefined,
      bedrooms: params.get('bedrooms') ? parseInt(params.get('bedrooms')!) : undefined,
      bathrooms: params.get('bathrooms') ? parseInt(params.get('bathrooms')!) : undefined,
    };
  });

  useEffect(() => {
    // Cargar propiedades solo una vez al montar
    async function loadProperties() {
      setIsLoading(true);
      try {
        const properties = await getProperties();
        const sorted = [...properties].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
        setAllProperties(sorted);
        filterAndSetProperties(sorted, currentFilters);
      } catch (error) {
        console.error('Error al cargar propiedades:', error);
        setAllProperties([]);
        setFilteredProperties([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperties();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsLoading(true);
    filterAndSetProperties(allProperties, currentFilters);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters, allProperties]);

  const filterAndSetProperties = (propertiesToFilter: Property[], filters: SearchFilters) => {
    let properties = [...propertiesToFilter];
    if (filters.location && filters.location !== "any") {
      properties = properties.filter(p => p.city.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters.propertyType && filters.propertyType !== "any" as any) {
      properties = properties.filter(p => p.type === filters.propertyType);
    }
    if (filters.listingType && filters.listingType !== "any" as any) {
      properties = properties.filter(p => p.listingType === filters.listingType);
    }
    if (filters.minPrice) {
      properties = properties.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice) {
      properties = properties.filter(p => p.price <= filters.maxPrice!);
    }
    if (filters.bedrooms && filters.bedrooms > 0) {
      properties = properties.filter(p => p.bedrooms >= filters.bedrooms!);
    }
    if (filters.bathrooms && filters.bathrooms > 0) {
      properties = properties.filter(p => p.bathrooms >= filters.bathrooms!);
    }
    setFilteredProperties(properties);
  }

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters);
  };

  return (
    <div className="container py-8 px-2 md:px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Encuentra Tu Próxima Propiedad</h1>
      <div className="mb-6">
        <PropertySearchFilters onSearch={handleSearch} initialFilters={currentFilters} />
      </div>
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
          Ninguna propiedad coincide con tus filtros actuales. ¡Intenta ajustar tu búsqueda!
        </p>
      )}
    </div>
  );
}
