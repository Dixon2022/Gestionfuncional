
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProperties, updateProperty as updateStoreProperty } from '@/lib/property-store';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, phone: string) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<Pick<User, 'name' | 'phone' | 'email'>>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a stored session
    const storedUser = localStorage.getItem('propverse-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Ensure existing users in localStorage have a phone and name, add placeholder if not
        if (!parsedUser.phone) {
          parsedUser.phone = '000-000-0000'; 
        }
        if (!parsedUser.name) {
            parsedUser.name = parsedUser.email.split('@')[0] || 'Usuario';
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('propverse-user'); 
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, name: string, phone: string) => {
    const newUser: User = { id: Date.now().toString(), email, name, phone };
    setUser(newUser);
    localStorage.setItem('propverse-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('propverse-user');
  };

  const updateUser = (updatedInfo: Partial<Pick<User, 'name' | 'phone' | 'email'>>) => {
    if (user) {
      const oldPhoneNumber = user.phone;
      const newUserData = { ...user, ...updatedInfo };
      setUser(newUserData);
      localStorage.setItem('propverse-user', JSON.stringify(newUserData));

      // If phone number changed, update user's properties
      if (updatedInfo.phone && updatedInfo.phone !== oldPhoneNumber) {
        const userProperties = getProperties().filter(p => p.ownerId === user.id);
        userProperties.forEach(prop => {
          if (prop.agent) {
            const updatedAgentData = { ...prop.agent, phone: newUserData.phone };
            if (updatedInfo.email && prop.agent.email === user.email) { // also update email if it was the user's
                updatedAgentData.email = newUserData.email;
            }
             if (updatedInfo.name && prop.agent.name === user.name) { // also update name if it was the user's
                updatedAgentData.name = newUserData.name;
            }
            updateStoreProperty(prop.id, { agent: updatedAgentData }, user.id);
          }
        });
      }
      // If email changed, update user's properties agent email if it matched old email
      if (updatedInfo.email && updatedInfo.email !== user.email) {
        const userProperties = getProperties().filter(p => p.ownerId === user.id);
        userProperties.forEach(prop => {
          if (prop.agent && prop.agent.email === user.email) { // check if agent email was the old user email
            updateStoreProperty(prop.id, { agent: { ...prop.agent, email: newUserData.email } }, user.id);
          }
        });
      }
       // If name changed, update user's properties agent name if it matched old name
      if (updatedInfo.name && updatedInfo.name !== user.name) {
        const userProperties = getProperties().filter(p => p.ownerId === user.id);
        userProperties.forEach(prop => {
          if (prop.agent && prop.agent.name === user.name) { 
            updateStoreProperty(prop.id, { agent: { ...prop.agent, name: newUserData.name } }, user.id);
          }
        });
      }
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
