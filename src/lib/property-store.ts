
import type { Property } from './types';
import { MOCK_PROPERTIES_INITIAL } from './constants';

const PROPERTIES_STORAGE_KEY = 'propverse-properties';

let properties: Property[] = [];

// Initialize properties from localStorage or use MOCK_PROPERTIES_INITIAL
// This function should only be called on the client-side
const initializeProperties = () => {
  if (typeof window !== 'undefined') {
    const storedProperties = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (storedProperties) {
      try {
        properties = JSON.parse(storedProperties);
      } catch (e) {
        console.error("Error parsing properties from localStorage", e);
        // If parsing fails, fallback to initial mock properties and save them
        properties = [...MOCK_PROPERTIES_INITIAL];
        localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
      }
    } else {
      // No properties in localStorage, use initial mock and save them
      properties = [...MOCK_PROPERTIES_INITIAL];
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    }
  } else {
    // For server-side context (e.g., build time), use MOCK_PROPERTIES_INITIAL directly.
    // This state won't be persisted on the server beyond its immediate use.
    properties = [...MOCK_PROPERTIES_INITIAL];
  }
};

// Eagerly initialize properties when the module loads on the client
if (typeof window !== 'undefined') {
  initializeProperties();
}

// Listeners for property changes
type PropertyChangeListener = (updatedProperties: Property[]) => void;
const listeners: PropertyChangeListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...properties])); // Notify with a copy
};

export const getProperties = (): Property[] => {
  // On client-side, if properties array is empty for some reason after module load,
  // try re-initializing. This is a safeguard.
  if (typeof window !== 'undefined' && properties.length === 0 && localStorage.getItem(PROPERTIES_STORAGE_KEY)) {
    initializeProperties();
  }
  return [...properties]; // Return a copy to prevent direct mutation
};

export const getPropertyById = (id: string): Property | undefined => {
  // Ensure properties are fresh if called on client, useful if store was empty and re-initialized.
  const currentProperties = getProperties();
  return currentProperties.find(p => p.id === id);
};

export const addProperty = (property: Property): void => {
  // Ensure the current list is loaded before adding, especially if called early.
  const currentProperties = getProperties(); // Gets a fresh copy, including any localStorage updates
  properties = [property, ...currentProperties];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
};

export const deleteProperty = (propertyId: string, userId: string): boolean => {
  const currentProperties = getProperties();
  const propertyIndex = currentProperties.findIndex(p => p.id === propertyId);

  if (propertyIndex === -1) {
    console.warn(`Property with id ${propertyId} not found for deletion.`);
    return false; // Property not found
  }

  if (currentProperties[propertyIndex].ownerId !== userId) {
    console.warn(`User ${userId} is not authorized to delete property ${propertyId}.`);
    return false; // User not authorized
  }

  properties.splice(properties.findIndex(p => p.id === propertyId), 1); // Mutate the module-level array

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
  return true;
};


export const subscribeToProperties = (listener: PropertyChangeListener): (() => void) => {
  listeners.push(listener);
  // Immediately call listener with current properties
  listener(getProperties());
  
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

// Helper to convert square feet to square meters
export const sqftToSqm = (sqft: number): number => {
  return parseFloat((sqft * 0.092903).toFixed(1));
};

// Helper to convert square meters to square feet
export const sqmToSqft = (sqm: number): number => {
  return parseFloat((sqm / 0.092903).toFixed(0));
}
