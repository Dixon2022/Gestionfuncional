export type PropertyType = "House" | "Apartment" | "Condo" | "Townhouse" | "Land";

export interface Agent {
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
}

export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
  type: PropertyType;
  description: string;
  images: string[]; // URLs, first image is primary
  isFeatured?: boolean;
  agent: Agent;
  features?: string[];
  yearBuilt?: number;
  lotSize?: number; // in sq ft
}

export interface SearchFilters {
  location?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}
