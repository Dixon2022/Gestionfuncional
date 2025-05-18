
import type { Property } from './types';
import { MOCK_PROPERTIES_INITIAL } from './constants';

const PROPERTIES_STORAGE_KEY = 'propverse-properties';

// Initialize properties from localStorage or use MOCK_PROPERTIES_INITIAL
let properties: Property[] = [];

// This function should only be called on the client-side
const initializeProperties = () => {
  if (typeof window !== 'undefined') {
    const storedProperties = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (storedProperties) {
      try {
        properties = JSON.parse(storedProperties);
      } catch (e) {
        console.error("Error parsing properties from localStorage", e);
        properties = [...MOCK_PROPERTIES_INITIAL];
        localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
      }
    } else {
      properties = [...MOCK_PROPERTIES_INITIAL];
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    }
  } else {
    // For server-side rendering or initial build, use MOCK_PROPERTIES_INITIAL
    // This state won't be persisted server-side beyond the request.
    properties = [...MOCK_PROPERTIES_INITIAL];
  }
};

// Call initializeProperties when the module loads on the client
if (typeof window !== 'undefined') {
  initializeProperties();
}


// Listeners for property changes
type PropertyChangeListener = (updatedProperties: Property[]) => void;
const listeners: PropertyChangeListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(properties));
};

export const getProperties = (): Property[] => {
  // Ensure properties are initialized if accessed on client before full load
  if (typeof window !== 'undefined' && properties.length === 0 && MOCK_PROPERTIES_INITIAL.length > 0) {
     // This case might happen if getProperties is called very early.
     // initializeProperties should have run, but as a safeguard:
     const stored = localStorage.getItem(PROPERTIES_STORAGE_KEY);
     if (stored) {
        try {
            properties = JSON.parse(stored);
        } catch {
            // fallback if JSON is corrupted
            properties = [...MOCK_PROPERTIES_INITIAL];
        }
     } else {
        properties = [...MOCK_PROPERTIES_INITIAL];
     }
  }
  return properties;
};

export const getPropertyById = (id: string): Property | undefined => {
  return getProperties().find(p => p.id === id);
};

export const addProperty = (property: Property): void => {
  // Ensure current properties are loaded before adding
  const currentProperties = getProperties();
  properties = [property, ...currentProperties]; 
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
};

export const subscribeToProperties = (listener: PropertyChangeListener): (() => void) => {
  listeners.push(listener);
  // Immediately call listener with current properties
  // Ensure properties are initialized before notifying
  listener(getProperties()); 
  
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Helper to convert square feet to square meters for display, if needed
export const sqftToSqm = (sqft: number): number => {
  return parseFloat((sqft * 0.092903).toFixed(1));
};

// Helper to convert square meters to square feet
export const sqmToSqft = (sqm: number): number => {
    return parseFloat((sqm / 0.092903).toFixed(0));
}
