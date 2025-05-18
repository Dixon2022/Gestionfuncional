
import type { Property } from './types';
import { MOCK_PROPERTIES_INITIAL } from './constants';

/**
 * @en Storage key for properties in localStorage.
 * @es Clave de almacenamiento para las propiedades en localStorage.
 */
const PROPERTIES_STORAGE_KEY = 'propverse-properties';

/**
 * @en In-memory cache of properties.
 * @es Caché en memoria de las propiedades.
 */
let properties: Property[] = [];

/**
 * @en Initializes properties from localStorage or uses MOCK_PROPERTIES_INITIAL if localStorage is empty or data is corrupt.
 * @es Inicializa las propiedades desde localStorage o usa MOCK_PROPERTIES_INITIAL si localStorage está vacío o los datos están corruptos.
 */
const initializeProperties = () => {
  if (typeof window !== 'undefined') {
    let storedProperties = null;
    try {
      storedProperties = localStorage.getItem(PROPERTIES_STORAGE_KEY);
      if (storedProperties) {
        const parsedProperties = JSON.parse(storedProperties);
        if (Array.isArray(parsedProperties)) {
          properties = parsedProperties;
          // Ensure all mock properties have ownerId for consistency
          properties.forEach(p => {
            if (!p.ownerId && MOCK_PROPERTIES_INITIAL.find(mp => mp.id === p.id)) {
              p.ownerId = MOCK_PROPERTIES_INITIAL.find(mp => mp.id === p.id)!.ownerId;
            }
          });
        } else {
          console.warn("[EN] Properties in localStorage were not an array. Resetting to default. [ES] Las propiedades en localStorage no eran un array. Restableciendo a valores por defecto.");
          properties = [...MOCK_PROPERTIES_INITIAL];
          localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
        }
      } else {
        properties = [...MOCK_PROPERTIES_INITIAL];
        localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
      }
    } catch (e) {
      console.error("[EN] Error parsing properties from localStorage or invalid data. Resetting to default. [ES] Error al parsear propiedades desde localStorage o datos inválidos. Restableciendo a valores por defecto.", e);
      properties = [...MOCK_PROPERTIES_INITIAL];
      // Clear potentially corrupted data
      if (PROPERTIES_STORAGE_KEY) localStorage.removeItem(PROPERTIES_STORAGE_KEY);
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
    }
  } else {
    // Fallback for non-browser environments, primarily for initial setup.
    properties = [...MOCK_PROPERTIES_INITIAL];
  }
};

if (typeof window !== 'undefined') {
  initializeProperties();
}

/**
 * @en Type definition for a property change listener.
 * @es Definición de tipo para un listener de cambios en propiedades.
 */
type PropertyChangeListener = (updatedProperties: Property[]) => void;
/**
 * @en Array of active property change listeners.
 * @es Array de listeners activos de cambios en propiedades.
 */
const listeners: PropertyChangeListener[] = [];

/**
 * @en Notifies all registered listeners about property changes.
 * @es Notifica a todos los listeners registrados sobre cambios en las propiedades.
 */
const notifyListeners = () => {
  listeners.forEach(listener => listener([...properties]));
};

/**
 * @en Gets the current list of all properties. Initializes from localStorage if not already done.
 * @es Obtiene la lista actual de todas las propiedades. Inicializa desde localStorage si aún no se ha hecho.
 * @returns {Property[]} An array of properties. @es Un array de propiedades.
 */
export const getProperties = (): Property[] => {
  if (typeof window !== 'undefined' && properties.length === 0 && localStorage.getItem(PROPERTIES_STORAGE_KEY)) {
    initializeProperties();
  }
  return [...properties]; // Return a copy to prevent direct mutation
};

/**
 * @en Gets a specific property by its ID.
 * @es Obtiene una propiedad específica por su ID.
 * @param {string} id - @en The ID of the property to retrieve. @es El ID de la propiedad a obtener.
 * @returns {Property | undefined} The property if found, otherwise undefined. @es La propiedad si se encuentra, de lo contrario undefined.
 */
export const getPropertyById = (id: string): Property | undefined => {
  const currentProperties = getProperties(); // Ensures properties are initialized
  return currentProperties.find(p => p.id === id);
};

/**
 * @en Adds a new property to the list and saves to localStorage.
 * @es Añade una nueva propiedad a la lista y guarda en localStorage.
 * @param {Property} property - @en The property to add. @es La propiedad a añadir.
 * @returns {void}
 */
export const addProperty = (property: Property): void => {
  // Ensure properties are loaded before adding
  if (properties.length === 0 && typeof window !== 'undefined') {
    initializeProperties();
  }
  properties = [property, ...properties];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
};

/**
 * @en Updates an existing property if the user is the owner. Saves to localStorage.
 * @es Actualiza una propiedad existente si el usuario es el propietario. Guarda en localStorage.
 * @param {string} propertyId - @en The ID of the property to update. @es El ID de la propiedad a actualizar.
 * @param {Partial<Property>} updatedData - @en An object containing the fields to update. @es Un objeto que contiene los campos a actualizar.
 * @param {string} userId - @en The ID of the user attempting the update. @es El ID del usuario que intenta la actualización.
 * @returns {boolean} True if the update was successful, false otherwise. @es True si la actualización fue exitosa, false en caso contrario.
 */
export const updateProperty = (propertyId: string, updatedData: Partial<Property>, userId: string): boolean => {
  const propertyIndex = properties.findIndex(p => p.id === propertyId);

  if (propertyIndex === -1) {
    console.warn(`[EN] Property with id ${propertyId} not found for update. [ES] Propiedad con id ${propertyId} no encontrada para actualizar.`);
    return false;
  }

  if (properties[propertyIndex].ownerId !== userId) {
    console.warn(`[EN] User ${userId} is not authorized to update property ${propertyId}. [ES] Usuario ${userId} no autorizado para actualizar la propiedad ${propertyId}.`);
    return false;
  }

  properties[propertyIndex] = { ...properties[propertyIndex], ...updatedData };

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
  return true;
};

/**
 * @en Deletes a property if the user is the owner. Saves changes to localStorage.
 * @es Elimina una propiedad si el usuario es el propietario. Guarda los cambios en localStorage.
 * @param {string} propertyId - @en The ID of the property to delete. @es El ID de la propiedad a eliminar.
 * @param {string} userId - @en The ID of the user attempting the deletion. @es El ID del usuario que intenta la eliminación.
 * @returns {boolean} True if deletion was successful, false otherwise. @es True si la eliminación fue exitosa, false en caso contrario.
 */
export const deleteProperty = (propertyId: string, userId: string): boolean => {
  const propertyIndex = properties.findIndex(p => p.id === propertyId);

  if (propertyIndex === -1) {
    console.warn(`[EN] Property with id ${propertyId} not found for deletion. [ES] Propiedad con id ${propertyId} no encontrada para eliminar.`);
    return false;
  }

  if (properties[propertyIndex].ownerId !== userId) {
    console.warn(`[EN] User ${userId} is not authorized to delete property ${propertyId}. [ES] Usuario ${userId} no autorizado para eliminar la propiedad ${propertyId}.`);
    return false;
  }

  properties.splice(propertyIndex, 1);

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(properties));
  }
  notifyListeners();
  return true;
};

/**
 * @en Subscribes a listener function to property changes.
 * @es Suscribe una función listener a los cambios en las propiedades.
 * @param {PropertyChangeListener} listener - @en The function to call when properties change. @es La función a llamar cuando las propiedades cambian.
 * @returns {() => void} A function to unsubscribe the listener. @es Una función para desuscribir el listener.
 */
export const subscribeToProperties = (listener: PropertyChangeListener): (() => void) => {
  listeners.push(listener);
  // Call listener immediately with current properties
  listener(getProperties()); 
  
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

/**
 * @en Converts square feet to square meters.
 * @es Convierte pies cuadrados a metros cuadrados.
 * @param {number} sqft - @en Area in square feet. @es Área en pies cuadrados.
 * @returns {number} Area in square meters, rounded to one decimal place. @es Área en metros cuadrados, redondeada a un decimal.
 */
export const sqftToSqm = (sqft: number): number => {
  return parseFloat((sqft * 0.092903).toFixed(1));
};

/**
 * @en Converts square meters to square feet.
 * @es Convierte metros cuadrados a pies cuadrados.
 * @param {number} sqm - @en Area in square meters. @es Área en metros cuadrados.
 * @returns {number} Area in square feet, rounded to the nearest whole number. @es Área en pies cuadrados, redondeada al número entero más cercano.
 */
export const sqmToSqft = (sqm: number): number => {
  return parseFloat((sqm / 0.092903).toFixed(0));
};
