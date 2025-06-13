"use client";

import { useState, useEffect } from "react";
import type { SearchFilters, PropertyType, ListingType } from "@/lib/types";
import { PROPERTY_TYPES, CITIES, LISTING_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/contexts/currency-context";

interface PropertySearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const MAX_PRICE_CRC_SALE = 500000000;
const MAX_PRICE_CRC_RENT = 5000000;

const defaultFilters: SearchFilters = {
  location: "",
  propertyType: undefined,
  listingType: undefined,
  minPrice: 0,
  maxPrice: MAX_PRICE_CRC_SALE,
  bedrooms: 0,
  bathrooms: 0,
};

export function PropertySearchFilters({
  onSearch,
  initialFilters,
}: PropertySearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(
    initialFilters || defaultFilters
  );
  const { currency, convert, symbol } = useCurrency();

  // Convierte de CRC a la moneda seleccionada
  const toDisplay = (crc: number) => Math.round(convert(crc));
  // Convierte de la moneda seleccionada a CRC
  const toCRC = (val: number) => Math.round(val / convert(1));

  const getMaxPriceForType = (listingType?: ListingType) => {
    return listingType === "Alquiler" ? MAX_PRICE_CRC_RENT : MAX_PRICE_CRC_SALE;
  };

  const [priceRange, setPriceRange] = useState<[number, number]>([
    toDisplay(initialFilters?.minPrice || defaultFilters.minPrice || 0),
    toDisplay(
      initialFilters?.maxPrice ||
        getMaxPriceForType(initialFilters?.listingType)
    ),
  ]);

  useEffect(() => {
    setPriceRange([
      toDisplay(filters.minPrice || 0),
      toDisplay(filters.maxPrice || getMaxPriceForType(filters.listingType)),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, filters.listingType]);

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      setPriceRange([
        initialFilters.minPrice || 0,
        initialFilters.maxPrice ||
          getMaxPriceForType(initialFilters.listingType),
      ]);
    }
  }, [initialFilters]);

  useEffect(() => {
    // Adjust max price for slider if listing type changes
    const newMaxPrice = getMaxPriceForType(filters.listingType);
    setPriceRange((prevRange) => [
      Math.min(prevRange[0], newMaxPrice), // Ensure min is not greater than new max
      Math.min(prevRange[1], newMaxPrice), // Ensure current max is not greater than new overall max
    ]);
    setFilters((prev) => ({
      ...prev,
      maxPrice: Math.min(prev.maxPrice || newMaxPrice, newMaxPrice),
    }));
  }, [filters.listingType]);

  const handleSelectChange = (name: keyof SearchFilters) => (value: string) => {
    const val = value === "any" ? undefined : value;
    setFilters((prev) => ({ ...prev, [name]: val as any }));
  };

  const handleSliderChange =
    (name: keyof SearchFilters) => (value: number[]) => {
      setFilters((prev) => ({
        ...prev,
        [name]: value[0] === 0 ? undefined : value[0],
      }));
    };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setFilters((prev) => ({
      ...prev,
      minPrice: toCRC(value[0]),
      maxPrice: toCRC(value[1]),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure minPrice is not greater than maxPrice before submitting
    const finalFilters = { ...filters };
    if (
      finalFilters.minPrice &&
      finalFilters.maxPrice &&
      finalFilters.minPrice > finalFilters.maxPrice
    ) {
      finalFilters.minPrice = finalFilters.maxPrice; // Or some other logic, like swapping them
    }
    onSearch(finalFilters);
  };

  const handleReset = () => {
    const defaultMax = getMaxPriceForType(undefined); // Reset to sale max price
    setFilters({ ...defaultFilters, maxPrice: defaultMax });
    setPriceRange([0, defaultMax]);
    onSearch({ ...defaultFilters, maxPrice: defaultMax });
  };

  return (
    <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-blue-900">
          <Search className="h-6 w-6 text-blue-500" />
          Filtrar Propiedades
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="location" className="text-blue-900 font-semibold">
              Ubicación
            </Label>
            <Select
              value={filters.location || "any"}
              onValueChange={handleSelectChange("location")}
            >
              <SelectTrigger
                id="location"
                className="bg-white/80 border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              >
                <SelectValue placeholder="Cualquier Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquier Ubicación</SelectItem>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="propertyType"
              className="text-blue-900 font-semibold"
            >
              Tipo de Propiedad
            </Label>
            <Select
              value={filters.propertyType || "any"}
              onValueChange={handleSelectChange("propertyType")}
            >
              <SelectTrigger
                id="propertyType"
                className="bg-white/80 border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              >
                <SelectValue placeholder="Cualquier Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquier Tipo</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="listingType"
              className="text-blue-900 font-semibold"
            >
              Tipo de Listado
            </Label>
            <Select
              value={filters.listingType || "any"}
              onValueChange={handleSelectChange("listingType")}
            >
              <SelectTrigger
                id="listingType"
                className="bg-white/80 border-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
              >
                <SelectValue placeholder="Venta o Alquiler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Venta o Alquiler</SelectItem>
                {LISTING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="priceRange" className="text-blue-900 font-semibold">
              Rango de Precio:
            </Label>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-100 via-sky-100 to-indigo-100 shadow-inner w-fit mb-2">
              <span className="font-bold text-blue-700 text-lg">
                {symbol}
                {priceRange[0].toLocaleString()}
              </span>
              <span className="text-blue-400 font-bold text-xl">—</span>
              <span className="font-bold text-blue-700 text-lg">
                {symbol}
                {priceRange[1].toLocaleString()}
                {filters.listingType === "Alquiler" ? (
                  <span className="text-base font-normal text-blue-500">
                    /mes
                  </span>
                ) : null}
              </span>
            </div>
            <Slider
              id="priceRange"
              min={0}
              max={toDisplay(getMaxPriceForType(filters.listingType))}
              step={
                filters.listingType === "Alquiler"
                  ? toDisplay(50000)
                  : toDisplay(1000000)
              }
              value={priceRange}
              onValueChange={(value) =>
                handlePriceRangeChange(value as [number, number])
              }
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms" className="text-blue-900 font-semibold">
              Mín. Habitaciones:{" "}
              <span className="font-bold text-blue-700">
                {filters.bedrooms || "Cualquiera"}
              </span>
            </Label>
            <Slider
              id="bedrooms"
              min={0}
              max={5}
              step={1}
              value={[filters.bedrooms || 0]}
              onValueChange={handleSliderChange("bedrooms")}
              className="py-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms" className="text-blue-900 font-semibold">
              Mín. Baños:{" "}
              <span className="font-bold text-blue-700">
                {filters.bathrooms || "Cualquiera"}
              </span>
            </Label>
            <Slider
              id="bathrooms"
              min={0}
              max={5}
              step={1}
              value={[filters.bathrooms || 0]}
              onValueChange={handleSliderChange("bathrooms")}
              className="py-2"
            />
          </div>
        </form>
        <div className="flex flex-row gap-4 mt-4 justify-end col-span-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <X className="mr-2 h-4 w-4" /> Reiniciar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-600"
          >
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
