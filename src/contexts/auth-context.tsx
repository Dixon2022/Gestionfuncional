
'use client';

import type { User } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, phone: string) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<Pick<User, 'name' | 'phone'>>) => void;
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
        // Ensure existing users in localStorage have a phone, add placeholder if not
        if (!parsedUser.phone) {
          parsedUser.phone = '000-000-0000'; // Placeholder for users from older sessions
        }
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('propverse-user'); // Clear corrupted data
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

  const updateUser = (updatedInfo: Partial<Pick<User, 'name' | 'phone'>>) => {
    if (user) {
      const newUserData = { ...user, ...updatedInfo };
      setUser(newUserData);
      localStorage.setItem('propverse-user', JSON.stringify(newUserData));
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
