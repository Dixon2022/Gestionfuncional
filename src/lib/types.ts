
export type PropertyType = "Casa" | "Apartamento" | "Condominio" | "Adosado" | "Terreno";
export type ListingType = "Venta" | "Alquiler";

export interface Owner {
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
  area: number; // in sq m
  type: PropertyType;
  listingType: ListingType; // Added
  description: string;
  images: string[]; // URLs, first image is primary
  isFeatured?: boolean;
  owner: Owner; // Owner details
  features?: string[];
  yearBuilt?: number;
  lotSize?: number; // in sq m
  photoDataUri?: string; // Used for newly created properties before image upload
  ownerId?: string; // ID of the user who created this property
  createdAt?: number; // Timestamp of creation
}

export interface SearchFilters {
  location?: string;
  propertyType?: PropertyType;
  listingType?: ListingType; // Added
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export interface User {
  id: string; // Stable unique ID for the user
  email: string; 
  name: string;
  phone: string;
}
