
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProperties, updateProperty as updateStoreProperty } from '@/lib/property-store';

/**
 * @en Interface for the authentication context.
 * @es Interfaz para el contexto de autenticación.
 */
interface AuthContextType {
  /**
   * @en The current authenticated user, or null if no user is logged in.
   * @es El usuario autenticado actual, o null si no hay ningún usuario conectado.
   */
  user: User | null;
  /**
   * @en Logs in a user or creates a new user session.
   * @es Inicia sesión para un usuario o crea una nueva sesión de usuario.
   * @param {string} email - @en The user's email. @es El email del usuario.
   * @param {string} name - @en The user's name. @es El nombre del usuario.
   * @param {string} phone - @en The user's phone number. @es El número de teléfono del usuario.
   * @returns {void}
   */
  login: (email: string, name: string, phone: string) => void;
  /**
   * @en Logs out the current user.
   * @es Cierra la sesión del usuario actual.
   * @returns {void}
   */
  logout: () => void;
  /**
   * @en Updates the current user's profile information.
   * @es Actualiza la información del perfil del usuario actual.
   * @param {Partial<Pick<User, 'name' | 'email' | 'phone'>>} updatedInfo - @en The user information to update. @es La información del usuario a actualizar.
   * @returns {void}
   */
  updateUser: (updatedInfo: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => void;
  /**
   * @en Indicates if the authentication state is currently being loaded.
   * @es Indica si el estado de autenticación se está cargando actualmente.
   */
  loading: boolean;
}

/**
 * @en Authentication context to manage user session and data.
 * @es Contexto de autenticación para gestionar la sesión y datos del usuario.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @en Key for storing the current user's email in localStorage.
 * @es Clave para almacenar el email del usuario actual en localStorage.
 */
const CURRENT_USER_EMAIL_KEY = 'propverse-current-user-email';
/**
 * @en Prefix for storing user data in localStorage, keyed by email.
 * @es Prefijo para almacenar datos de usuario en localStorage, usando el email como clave.
 */
const USER_DATA_PREFIX = 'propverse-user-data-';

/**
 * @en Provides authentication state and functions to its children.
 * @es Provee el estado de autenticación y funciones a sus componentes hijos.
 * @param {object} props - @en Component props. @es Props del componente.
 * @param {ReactNode} props.children - @en The child components to render. @es Los componentes hijos a renderizar.
 * @returns {JSX.Element} The AuthProvider component.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * @en Effect to load user session from localStorage on initial mount.
     * @es Efecto para cargar la sesión del usuario desde localStorage en el montaje inicial.
     */
    const currentUserEmail = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
    if (currentUserEmail) {
      const storedUserData = localStorage.getItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData) as User;
          setUser({
            ...parsedUser,
            name: parsedUser.name || parsedUser.email.split('@')[0] || 'Usuario', // Fallback name
            phone: parsedUser.phone || '000-000-0000', // Fallback phone
          });
        } catch (e) {
          console.error("[EN] Error parsing user from localStorage. [ES] Error al parsear usuario desde localStorage", e);
          localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
          localStorage.removeItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
        }
      } else {
         // If user data is missing for the stored email, clear the current user email.
         localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * @en Handles user login or registration.
   * @es Maneja el inicio de sesión o registro del usuario.
   * @param {string} email - @en User's email. @es Email del usuario.
   * @param {string} name - @en User's name, used if creating a new profile. @es Nombre del usuario, usado si se crea un nuevo perfil.
   * @param {string} phone - @en User's phone, used if creating a new profile or updating an existing one without a phone. @es Teléfono del usuario, usado si se crea un nuevo perfil o se actualiza uno existente sin teléfono.
   */
  const login = (email: string, name: string, phone: string) => {
    const storageKey = `${USER_DATA_PREFIX}${email}`;
    let existingUserDataString = localStorage.getItem(storageKey);
    let userToLogin: User;

    if (existingUserDataString) {
      // User exists, load their stored data.
      const existingUser = JSON.parse(existingUserDataString) as User;
      userToLogin = {
        ...existingUser,
        // Ensure essential fields are present and not overwritten by login form placeholders if they exist
        name: existingUser.name || name || email.split('@')[0] || 'Usuario',
        phone: existingUser.phone || phone || '000-000-0000',
      };
    } else {
      // New user (this path is taken by signup if email is new, or first login to an unknown email)
      userToLogin = { 
        id: Date.now().toString(), // Simple ID generation for mock
        email, 
        name: name || email.split('@')[0] || 'Usuario', 
        phone: phone || '000-000-0000',
      };
    }
    
    localStorage.setItem(storageKey, JSON.stringify(userToLogin));
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
    setUser(userToLogin);
  };

  /**
   * @en Handles user logout.
   * @es Maneja el cierre de sesión del usuario.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  };

  /**
   * @en Updates user profile information and propagates changes to their properties.
   * @es Actualiza la información del perfil del usuario y propaga los cambios a sus propiedades.
   * @param {Partial<Pick<User, 'name' | 'email' | 'phone'>>} updatedInfo - @en The information to update. @es La información a actualizar.
   */
  const updateUser = (updatedInfo: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => {
    if (user) {
      const oldUser = { ...user }; 
      const newUserData: User = { 
        ...user, 
        name: updatedInfo.name !== undefined ? updatedInfo.name : user.name,
        email: updatedInfo.email !== undefined ? updatedInfo.email : user.email,
        phone: updatedInfo.phone !== undefined ? updatedInfo.phone : user.phone,
      };

      // If email is being changed, update storage keys for user data
      if (newUserData.email !== oldUser.email) {
        localStorage.removeItem(`${USER_DATA_PREFIX}${oldUser.email}`); 
        localStorage.setItem(CURRENT_USER_EMAIL_KEY, newUserData.email);
      }
      localStorage.setItem(`${USER_DATA_PREFIX}${newUserData.email}`, JSON.stringify(newUserData));
      setUser(newUserData);

      // Propagate changes to user's properties' agent details
      const userProperties = getProperties().filter(p => p.ownerId === newUserData.id);
      userProperties.forEach(prop => {
        let agentUpdates: Partial<typeof prop.agent> = {};
        let needsUpdate = false;

        if (updatedInfo.phone !== undefined && prop.agent.phone === oldUser.phone) {
          agentUpdates.phone = newUserData.phone;
          needsUpdate = true;
        }
        if (updatedInfo.email !== undefined && prop.agent.email === oldUser.email) {
          agentUpdates.email = newUserData.email;
          needsUpdate = true;
        }
        if (updatedInfo.name !== undefined && prop.agent.name === oldUser.name) {
          agentUpdates.name = newUserData.name;
          needsUpdate = true;
        }

        if (needsUpdate) {
          updateStoreProperty(prop.id, { agent: { ...prop.agent, ...agentUpdates } }, newUserData.id);
        }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @en Custom hook to use the AuthContext.
 * @es Hook personalizado para usar el AuthContext.
 * @throws {Error} If used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('[EN] useAuth must be used within an AuthProvider. [ES] useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
