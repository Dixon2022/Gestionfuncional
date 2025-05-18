
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProperties, updateProperty as updateStoreProperty } from '@/lib/property-store';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, phone: string) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_EMAIL_KEY = 'propverse-current-user-email';
const USER_DATA_PREFIX = 'propverse-user-data-';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a stored session
    const currentUserEmail = localStorage.getItem(CURRENT_USER_EMAIL_KEY);
    if (currentUserEmail) {
      const storedUserData = localStorage.getItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData) as User;
          // Ensure existing users have all required fields, add placeholders if not
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
        // If current user email exists but no data, clear it
         localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, name: string, phone: string) => {
    let existingUserData = localStorage.getItem(`${USER_DATA_PREFIX}${email}`);
    let userToLogin: User;

    if (existingUserData) {
      // User exists, load their data
      userToLogin = JSON.parse(existingUserData) as User;
      // Update name and phone if they were provided (e.g. from signup form on a re-login attempt)
      // Or if the login form itself collected more details
      userToLogin.name = name || userToLogin.name;
      userToLogin.phone = phone || userToLogin.phone;
    } else {
      // New user (for this email)
      userToLogin = { 
        id: Date.now().toString(), // Generate a stable ID
        email, 
        name, 
        phone 
      };
    }
    
    localStorage.setItem(`${USER_DATA_PREFIX}${email}`, JSON.stringify(userToLogin));
    localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
    setUser(userToLogin);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
    // We don't remove USER_DATA_PREFIX item, so user's data "persists" for next login
  };

  const updateUser = (updatedInfo: Partial<User>) => {
    if (user) {
      const oldUser = { ...user }; // Store a copy of the old user data for comparison
      const newUserData = { ...user, ...updatedInfo };

      // If email is being changed
      if (updatedInfo.email && updatedInfo.email !== oldUser.email) {
        localStorage.removeItem(`${USER_DATA_PREFIX}${oldUser.email}`); // Remove old email-keyed data
        localStorage.setItem(`${USER_DATA_PREFIX}${newUserData.email}`, JSON.stringify(newUserData));
        localStorage.setItem(CURRENT_USER_EMAIL_KEY, newUserData.email);
      } else {
        // If email is not changed, just update the data for the current email
        localStorage.setItem(`${USER_DATA_PREFIX}${newUserData.email}`, JSON.stringify(newUserData));
      }
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
