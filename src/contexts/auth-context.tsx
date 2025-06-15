'use client';

import type { User, Role} from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProperties, updateProperty as updateStoreProperty } from '@/lib/property-store';
import { parseDomainOfCategoryAxis } from 'recharts/types/util/ChartUtils';



interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, phone: string, role: Role) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<Pick<User, 'name' | 'email' | 'phone' | 'userDescription'>>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_EMAIL_KEY = 'FindHome-current-user-email';
const USER_DATA_PREFIX = 'FindHome-user-data-';

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
          console.error("Error al parsear usuario desde localStorage", e);
          localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
          localStorage.removeItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
        }
      } else {
        localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, name: string, phone: string, role: Role) => {
    const storageKey = `${USER_DATA_PREFIX}${email}`;
    let existingUserDataString = localStorage.getItem(storageKey);
    let userToLogin: User;

    if (existingUserDataString) {
      const existingUser = JSON.parse(existingUserDataString) as User;
      userToLogin = {
        ...existingUser,
        name: existingUser.name || name || email.split('@')[0] || 'Usuario',
        phone: existingUser.phone || phone || '000-000-0000' ,
        role: role || 'user', 
      };
    } else {
      userToLogin = {
        id: Date.now().toString(),
        email,
        name: name || email.split('@')[0] || 'Usuario',
        phone: phone || '000-000-0000' , 
        role: role ||'user' ,
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

  const updateUser = async (updatedInfo: Partial<User>) => {
    if (user) {
      const oldUser = { ...user };
      const newUserData: User = {
        ...user,
        name: updatedInfo.name !== undefined ? updatedInfo.name : user.name,
        email: updatedInfo.email !== undefined ? updatedInfo.email : user.email,
        phone: updatedInfo.phone !== undefined ? updatedInfo.phone : user.phone,
        userDescription: updatedInfo.userDescription !== undefined ? updatedInfo.userDescription : user.userDescription,
      };

      if (newUserData.email !== oldUser.email) {
        localStorage.removeItem(`${USER_DATA_PREFIX}${oldUser.email}`);
        localStorage.setItem(CURRENT_USER_EMAIL_KEY, newUserData.email);
      }
      localStorage.setItem(`${USER_DATA_PREFIX}${newUserData.email}`, JSON.stringify(newUserData));
      setUser(newUserData);

      try {
        const allProperties = await getProperties(); // ✅ Esperar la promesa
        const userProperties = allProperties.filter(p => p.ownerId === newUserData.id);

        userProperties.forEach(prop => {
          let agentUpdates: Partial<typeof prop.owner> = {};
          let needsUpdate = false;

          if (updatedInfo.name !== undefined && prop.owner.name === oldUser.name) {
            agentUpdates.name = newUserData.name;
            needsUpdate = true;
          }
          if (updatedInfo.email !== undefined && prop.owner.email === oldUser.email) {
            agentUpdates.email = newUserData.email;
            needsUpdate = true;
          }
          if (updatedInfo.phone !== undefined && prop.owner.phone === oldUser.phone) {
            agentUpdates.phone = newUserData.phone;
            needsUpdate = true;
          }

          if (needsUpdate) {
            updateStoreProperty(prop.id, { owner: { ...prop.owner, ...agentUpdates } }, newUserData.id);
          }
        });
      } catch (err) {
        console.error("Error actualizando propiedades del usuario", err);
      }

      // Sincroniza con el servidor
      try {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newUserData.email,
            name: newUserData.name,
            phone: newUserData.phone,
            userDescription: newUserData.userDescription,
          }),
        });
      } catch (err) {
        console.error("Error sincronizando usuario con el servidor", err);
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
