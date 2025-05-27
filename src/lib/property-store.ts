
import type { Property } from './types';
import { MOCK_PROPERTIES_INITIAL } from './constants';

const PROPERTIES_STORAGE_KEY = 'propverse-properties';

let properties: Property[] = [];

const initializeProperties = () => {
  if (typeof window !== 'undefined') {
    let storedProperties = null;
    try {
      storedProperties = localStorage.getItem(PROPERTIES_STORAGE_KEY);
      if (storedProperties) {
        const parsedProperties = JSON.parse(storedProperties);
        if (Array.isArray(parsedProperties)) {
          properties = parsedProperties;
          properties.forEach(p => {
            if (!p.ownerId && MOCK_PROPERTIES_INITIAL.find(mp => mp.id === p.id)) {
              p.ownerId = MOCK_PROPERTIES_INITIAL.find(mp => mp.id === p.id)!.ownerId;
            }
          });
        } else {
          console.warn("Las propiedades en localStorage no eran un array. Restableciendo a valores por defecto.");
          properties = [...MOCK_PROPERTIES_INITIAL];
          localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
        }
      } else {
        properties = [...MOCK_PROPERTIES_INITIAL];
        localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
      }
    } catch (e) {
      console.error("Error al parsear propiedades desde localStorage o datos inválidos. Restableciendo a valores por defecto.", e);
      properties = [...MOCK_PROPERTIES_INITIAL];
      if (PROPERTIES_STORAGE_KEY) localStorage.removeItem(PROPERTIES_STORAGE_KEY);
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    }
  } else {
    properties = [...MOCK_PROPERTIES_INITIAL];
  }
};

if (typeof window !== 'undefined') {
  initializeProperties();
}

type PropertyChangeListener = (updatedProperties: Property[]) => void;
const listeners: PropertyChangeListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...properties]));
};

// Refactored to fetch from API, removing MOCK_PROPERTIES_INITIAL fallback for reads.
export const getProperties = async (): Promise<Property[]> => {
  if (typeof window !== 'undefined') {
    try {
      const response = await fetch('/api/property');
      if (!response.ok) {
        console.error('Failed to fetch properties from API. Status:', response.status);
        // Do not fall back to MOCK_PROPERTIES_INITIAL or potentially stale localStorage.
        // Return empty array or throw error. For now, returning empty array.
        properties = []; // Clear local cache on API failure
        localStorage.removeItem(PROPERTIES_STORAGE_KEY); // Clear localStorage cache
        notifyListeners();
        return []; 
      }
      const apiProperties: Property[] = await response.json();
      properties = apiProperties; // Update local in-memory store (cache)
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties)); // Update localStorage (cache)
      notifyListeners(); // Notify subscribers of new data
      return [...properties];
    } catch (error) {
      console.error('Error fetching properties from API:', error);
      // Do not fall back to MOCK_PROPERTIES_INITIAL.
      properties = []; // Clear local cache on API error
      localStorage.removeItem(PROPERTIES_STORAGE_KEY); // Clear localStorage cache
      notifyListeners();
      return [];
    }
  } else {
    // For server-side rendering or environments without window, cannot make API calls here.
    // Return empty array as MOCK_PROPERTIES_INITIAL should not be used.
    return []; 
  }
};

export const getPropertyById = async (id: string): Promise<Property | null> => {
  // Remove direct check from local 'properties' array initially, to prioritize API.
  // Local cache can be checked, but API is the source of truth for reads.
  // For simplicity in this step, we'll just fetch. A more advanced cache strategy could be used.

  if (typeof window !== 'undefined') {
    try {
      const response = await fetch(`/api/property/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Property not found on API
        }
        console.error(`Failed to fetch property ${id} from API. Status:`, response.status);
        return null; // Or throw an error
      }
      const apiProperty: Property = await response.json();
      // Optionally, update local 'properties' array and localStorage if using them as a cache.
      // For now, just return the fetched property.
      return apiProperty;
    } catch (error) {
      console.error(`Error fetching property ${id} from API:`, error);
      return null; // Or throw an error
    }
  } else {
    // For server-side rendering or environments without window.
    // Cannot make API calls here. Return null as MOCK_PROPERTIES_INITIAL should not be used.
    return null;
  }
};


export const addProperty = (property: Property): void => {
  if (properties.length === 0 && typeof window !== 'undefined') {
    initializeProperties();
  }
  properties = [property, ...properties];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
};

export const updateProperty = (propertyId: string, updatedData: Partial<Property>, userId: string): boolean => {
  const propertyIndex = properties.findIndex(p => p.id === propertyId);

  if (propertyIndex === -1) {
    console.warn(`Propiedad con id ${propertyId} no encontrada para actualizar.`);
    return false;
  }

  if (properties[propertyIndex].ownerId !== userId) {
    console.warn(`Usuario ${userId} no autorizado para actualizar la propiedad ${propertyId}.`);
    return false;
  }

  properties[propertyIndex] = { ...properties[propertyIndex], ...updatedData };

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
  return true;
};

export const deleteProperty = (propertyId: string, userId: string): boolean => {
  const propertyIndex = properties.findIndex(p => p.id === propertyId);

  if (propertyIndex === -1) {
    console.warn(`Propiedad con id ${propertyId} no encontrada para eliminar.`);
    return false;
  }

  if (properties[propertyIndex].ownerId !== userId) {
    console.warn(`Usuario ${userId} no autorizado para eliminar la propiedad ${propertyId}.`);
    return false;
  }

  properties.splice(propertyIndex, 1);

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
  return true;
};

export const subscribeToProperties = (listener: PropertyChangeListener): (() => void) => {
  listeners.push(listener);
  // Immediately provide current state, but also trigger an async fetch if needed.
  // The listener will be called again once getProperties completes its async fetch.
  listener([...properties]); // Provide current snapshot

  // Trigger a fetch to ensure data is fresh, especially on initial subscription.
  // This will call notifyListeners() once done.
  getProperties().catch(error => console.error("Error in subscribeToProperties initial fetch:", error));
  
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export const sqftToSqm = (sqft: number): number => {
  return parseFloat((sqft * 0.092903).toFixed(1));
};

export const sqmToSqft = (sqm: number): number => {
  return parseFloat((sqm / 0.092903).toFixed(0));
};
