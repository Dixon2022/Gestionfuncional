
import type { Property } from './types';
import { MOCK_PROPERTIES_INITIAL } from './constants';

let properties: Property[] = [...MOCK_PROPERTIES_INITIAL];

// Listeners for property changes
type PropertyChangeListener = (updatedProperties: Property[]) => void;
const listeners: PropertyChangeListener[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(properties));
};

export const getProperties = (): Property[] => {
  return properties;
};

export const getPropertyById = (id: string): Property | undefined => {
  return properties.find(p => p.id === id);
};

export const addProperty = (property: Property): void => {
  properties = [property, ...properties]; // Add to the beginning
  notifyListeners();
};

export const subscribeToProperties = (listener: PropertyChangeListener): (() => void) => {
  listeners.push(listener);
  // Immediately call listener with current properties
  listener(properties); 
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
