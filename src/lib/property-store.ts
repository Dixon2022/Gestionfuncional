import type { Property } from './types';

const API_BASE = '/api/property';  // Ruta base para API (ajusta según tu setup)

// Obtener todas las propiedades
export const getProperties = async (): Promise<Property[]> => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Error al obtener propiedades');
  return res.json();
};

// Obtener propiedad por ID
export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) return undefined;
  return res.json();
};

export const getPropertiesByOwner = async (ownerId: string): Promise<Property[]> => {
  const res = await fetch(`${API_BASE}?ownerId=${ownerId}`);
  if (!res.ok) throw new Error('Error al obtener propiedades del usuario');
  return res.json();
};

// Añadir propiedad
export const addProperty = async (property: Property): Promise<Property> => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(property),
  });
  if (!res.ok) throw new Error('Error al agregar propiedad');
  return res.json();
};

// Actualizar propiedad (requiere userId para autorización)
export const updateProperty = async (propertyId: string, updatedData: Partial<Property>, userId: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE}/${propertyId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'X-User-Id': userId // o autorización con token según tu auth
    },
    body: JSON.stringify(updatedData),
  });
  return res.ok;
};

// Eliminar propiedad
export const deleteProperty = async (propertyId: string, userId: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE}/${propertyId}`, {
    method: 'DELETE',
    headers: {
      'X-User-Id': userId
    }
  });
  return res.ok;
};
