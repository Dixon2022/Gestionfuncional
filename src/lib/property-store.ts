
import type { Property } from './types';
import { MOCK_PROPERTIES_INITIAL } from './constants';

const PROPERTIES_STORAGE_KEY = 'propverse-properties';

let properties: Property[] = [];

// Initialize properties from localStorage or use MOCK_PROPERTIES_INITIAL
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

export const getProperties = (): Property[] => {
  if (typeof window !== 'undefined' && properties.length === 0 && localStorage.getItem(PROPERTIES_STORAGE_KEY)) {
    initializeProperties();
  }
  return [...properties];
};

export const getPropertyById = (id: string): Property | undefined => {
  const currentProperties = getProperties();
  return currentProperties.find(p => p.id === id);
};

export const addProperty = (property: Property): void => {
  const currentProperties = getProperties();
  properties = [property, ...currentProperties];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
};

export const updateProperty = (propertyId: string, updatedData: Partial<Property>, userId: string): boolean => {
  const propertyIndex = properties.findIndex(p => p.id === propertyId);

  if (propertyIndex === -1) {
    console.warn(`Property with id ${propertyId} not found for update.`);
    return false;
  }

  if (properties[propertyIndex].ownerId !== userId) {
    console.warn(`User ${userId} is not authorized to update property ${propertyId}.`);
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
    console.warn(`Property with id ${propertyId} not found for deletion.`);
    return false;
  }

  if (properties[propertyIndex].ownerId !== userId) {
    console.warn(`User ${userId} is not authorized to delete property ${propertyId}.`);
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
  listener(getProperties());
  
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
