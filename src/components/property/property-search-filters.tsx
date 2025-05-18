
'use client';

import { useState, useEffect } from 'react';
import type { SearchFilters, PropertyType } from '@/lib/types';
import { PROPERTY_TYPES, CITIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertySearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const MAX_PRICE_CRC = 500000000; // Max price in CRC for slider

const defaultFilters: SearchFilters = {
  location: '',
  propertyType: undefined,
  minPrice: 0,
  maxPrice: MAX_PRICE_CRC, 
  bedrooms: 0, 
  bathrooms: 0, 
};

export function PropertySearchFilters({ onSearch, initialFilters }: PropertySearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || defaultFilters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters?.minPrice || defaultFilters.minPrice || 0, 
    initialFilters?.maxPrice || defaultFilters.maxPrice || MAX_PRICE_CRC
  ]);

  // Sync priceRange with filters if initialFilters change
  useEffect(() => {
    if (initialFilters) {
        setFilters(initialFilters);
        setPriceRange([
            initialFilters.minPrice || defaultFilters.minPrice || 0,
            initialFilters.maxPrice || defaultFilters.maxPrice || MAX_PRICE_CRC
        ]);
    }
  }, [initialFilters]);


  const handleSelectChange = (name: keyof SearchFilters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value === 'any' ? undefined : value }));
  };

  const handleSliderChange = (name: keyof SearchFilters) => (value: number[]) => {
     setFilters((prev) => ({ ...prev, [name]: value[0] === 0 ? undefined : value[0] }));
  };
  
  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setFilters((prev) => ({ ...prev, minPrice: value[0], maxPrice: value[1] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setPriceRange([defaultFilters.minPrice || 0, defaultFilters.maxPrice || MAX_PRICE_CRC]);
    onSearch(defaultFilters);
  };

  return (
    <Card className="mb-8 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Search className="mr-2 h-6 w-6 text-primary" />
          Filtrar Propiedades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Select value={filters.location || 'any'} onValueChange={handleSelectChange('location')}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Cualquier Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquier Ubicación</SelectItem>
                {CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyType">Tipo de Propiedad</Label>
            <Select value={filters.propertyType || 'any'} onValueChange={handleSelectChange('propertyType')}>
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Cualquier Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquier Tipo</SelectItem>
                {PROPERTY_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Label htmlFor="priceRange">Rango de Precio: ₡{priceRange[0].toLocaleString()} - ₡{priceRange[1].toLocaleString()}</Label>
            <Slider
              id="priceRange"
              min={0}
              max={MAX_PRICE_CRC}
              step={1000000} // Step in CRC
              value={priceRange}
              onValueChange={(value) => handlePriceRangeChange(value as [number,number])}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Mín. Habitaciones: {filters.bedrooms || 'Cualquiera'}</Label>
            <Slider
              id="bedrooms"
              min={0}
              max={5}
              step={1}
              value={[filters.bedrooms || 0]}
              onValueChange={handleSliderChange('bedrooms')}
               className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms">Mín. Baños: {filters.bathrooms || 'Cualquiera'}</Label>
            <Slider
              id="bathrooms"
              min={0}
              max={5}
              step={1} // Can be 0.5 if needed, but for min filter, 1 is fine
              value={[filters.bathrooms || 0]}
              onValueChange={handleSliderChange('bathrooms')}
               className="py-2"
            />
          </div>

          <div className="flex items-end space-x-3 md:col-span-2 lg:col-span-3 lg:justify-end">
            <Button type="button" variant="outline" onClick={handleReset} className="w-full lg:w-auto">
              <X className="mr-2 h-4 w-4" /> Reiniciar
            </Button>
            <Button type="submit" className="w-full lg:w-auto bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" /> Buscar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
