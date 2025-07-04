export type PropertyType = "Casa" | "Apartamento" | "Condominio" | "Adosado" | "Terreno";
export type ListingType = "Venta" | "Alquiler";
export type Role = 'user' | 'admin';
export interface Owner {
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  userDescription?: string; // <--- CAMBIO AQUÍ
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
  ownerId: number; // ID of the user who created this property (database ID is number)
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
  id: string; // Keep as string for frontend compatibility, but ensure it contains database ID
  email: string;
  name: string;
  phone: string;
  role: Role;
  description?: string;
  userDescription?: string; // <--- CAMBIO AQUÍ
}


  interface Session {
    user: {
      name: string
      email: string
      image?: string
      role: Role
    }
  }
