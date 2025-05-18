
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProperties, updateProperty as updateStoreProperty } from '@/lib/property-store';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, phone: string) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_EMAIL_KEY = 'propverse-current-user-email';
const USER_DATA_PREFIX = 'propverse-user-data-';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUserEmail = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
    if (currentUserEmail) {
      const storedUserData = localStorage.getItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData) as User;
          setUser({
            ...parsedUser,
            name: parsedUser.name || parsedUser.email.split('@')[0] || 'Usuario',
            phone: parsedUser.phone || '000-000-0000', 
          });
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
          localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
          localStorage.removeItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
        }
      } else {
         localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, name: string, phone: string) => {
    const storageKey = `${USER_DATA_PREFIX}${email}`;
    let existingUserData = localStorage.getItem(storageKey);
    let userToLogin: User;

    if (existingUserData) {
      // User exists, load their stored data.
      // The `name` and `phone` parameters from the login form are placeholders
      // and should not overwrite actual stored data for an existing user.
      userToLogin = JSON.parse(existingUserData) as User;
      // Ensure essential fields are present if old stored data was somehow incomplete
      userToLogin.name = userToLogin.name || email.split('@')[0] || 'Usuario';
      userToLogin.phone = userToLogin.phone || '000-000-0000';
    } else {
      // New user (this path is taken by signup if email is new, or first login to an unknown email)
      // Here, the `name` and `phone` parameters are the actual values from signup or derived/mock from login.
      userToLogin = { 
        id: Date.now().toString(), 
        email, 
        name, 
        phone 
      };
    }
    
    localStorage.setItem(storageKey, JSON.stringify(userToLogin));
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
    setUser(userToLogin);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
  };

  const updateUser = (updatedInfo: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => {
    if (user) {
      const oldUser = { ...user }; 
      const newUserData: User = { 
        ...user, 
        name: updatedInfo.name ?? user.name,
        email: updatedInfo.email ?? user.email,
        phone: updatedInfo.phone ?? user.phone,
      };

      // If email is being changed, update storage keys
      if (newUserData.email !== oldUser.email) {
        localStorage.removeItem(`${USER_DATA_PREFIX}${oldUser.email}`); 
        localStorage.setItem(CURRENT_USER_EMAIL_KEY, newUserData.email);
      }
      localStorage.setItem(`${USER_DATA_PREFIX}${newUserData.email}`, JSON.stringify(newUserData));
      setUser(newUserData);

      // Propagate changes to user's properties
      const userProperties = getProperties().filter(p => p.ownerId === newUserData.id);
      userProperties.forEach(prop => {
        let agentUpdates: Partial<typeof prop.agent> = {};
        let needsUpdate = false;

        if (updatedInfo.phone && prop.agent.phone === oldUser.phone) {
          agentUpdates.phone = newUserData.phone;
          needsUpdate = true;
        }
        if (updatedInfo.email && prop.agent.email === oldUser.email) {
          agentUpdates.email = newUserData.email;
          needsUpdate = true;
        }
        if (updatedInfo.name && prop.agent.name === oldUser.name) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

