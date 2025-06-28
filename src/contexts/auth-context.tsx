'use client';

import type { User, Role} from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getProperties, updateProperty as updateStoreProperty } from '@/lib/property-store';
import { parseDomainOfCategoryAxis } from 'recharts/types/util/ChartUtils';



interface AuthContextType {
  user: User | null;
  login: (email: string, name: string, phone: string, role: Role) => Promise<void>;
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
          
          // If user has a temporary ID (starts with temp_), fetch real ID from database
          if (parsedUser.id.startsWith('temp_') || parsedUser.id === Date.now().toString()) {
            fetch(`/api/user/by-email?email=${encodeURIComponent(currentUserEmail)}`)
              .then(response => response.json())
              .then(dbUser => {
                const updatedUser: User = {
                  ...parsedUser,
                  id: dbUser.id.toString(), // Use real database ID
                  name: parsedUser.name || parsedUser.email.split('@')[0] || 'Usuario',
                  phone: parsedUser.phone || '000-000-0000',
                  userDescription: dbUser.userDescription || parsedUser.userDescription,
                };
                
                // Update localStorage with real ID
                localStorage.setItem(`${USER_DATA_PREFIX}${currentUserEmail}`, JSON.stringify(updatedUser));
                setUser(updatedUser);
              })
              .catch(error => {
                console.error('Error fetching real user ID:', error);
                // Use the stored user data as fallback
                setUser({
                  ...parsedUser,
                  name: parsedUser.name || parsedUser.email.split('@')[0] || 'Usuario',
                  phone: parsedUser.phone || '000-000-0000',
                });
              })
              .finally(() => setLoading(false));
          } else {
            // User already has a real ID
            setUser({
              ...parsedUser,
              name: parsedUser.name || parsedUser.email.split('@')[0] || 'Usuario',
              phone: parsedUser.phone || '000-000-0000',
            });
            setLoading(false);
          }
        } catch (e) {
          console.error("Error al parsear usuario desde localStorage", e);
          localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
          localStorage.removeItem(`${USER_DATA_PREFIX}${currentUserEmail}`);
          setLoading(false);
        }
      } else {
        localStorage.removeItem(CURRENT_USER_EMAIL_KEY);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, name: string, phone: string, role: Role) => {
    try {
      // Fetch the real user from the database
      const response = await fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Usuario no encontrado en la base de datos');
      }
      
      const dbUser = await response.json();
      
      const userToLogin: User = {
        id: dbUser.id.toString(), // Use the real database ID
        email: dbUser.email,
        name: dbUser.name || name || email.split('@')[0] || 'Usuario',
        phone: dbUser.phone || phone || '000-000-0000',
        role: dbUser.role || role || 'user',
        userDescription: dbUser.userDescription,
      };

      const storageKey = `${USER_DATA_PREFIX}${email}`;
      localStorage.setItem(storageKey, JSON.stringify(userToLogin));
      localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
      setUser(userToLogin);
    } catch (error) {
      console.error('Error during login:', error);
      // Fallback to local storage if database fails (temporary)
      const storageKey = `${USER_DATA_PREFIX}${email}`;
      let existingUserDataString = localStorage.getItem(storageKey);
      let userToLogin: User;

      if (existingUserDataString) {
        const existingUser = JSON.parse(existingUserDataString) as User;
        userToLogin = {
          ...existingUser,
          name: existingUser.name || name || email.split('@')[0] || 'Usuario',
          phone: existingUser.phone || phone || '000-000-0000',
          role: role || 'user', 
        };
      } else {
        userToLogin = {
          id: `temp_${Date.now()}`, // Temporary ID with prefix to identify it's not real
          email,
          name: name || email.split('@')[0] || 'Usuario',
          phone: phone || '000-000-0000',
          role: role || 'user',
        };
      }

      localStorage.setItem(storageKey, JSON.stringify(userToLogin));
      localStorage.setItem(CURRENT_USER_EMAIL_KEY, email);
      setUser(userToLogin);
    }
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
        const allProperties = await getProperties();
        // Only update properties if user has a real database ID (not temporary)
        if (!newUserData.id.startsWith('temp_')) {
          const userIdNumber = parseInt(newUserData.id);
          if (!isNaN(userIdNumber)) {
            const userProperties = allProperties.filter(p => p.ownerId === userIdNumber);

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
          }
        }
      } catch (err) {
        console.error("Error actualizando propiedades del usuario", err);
      }

      // Sync with server if user has real database ID
      if (!newUserData.id.startsWith('temp_')) {
        try {
          const response = await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: newUserData.email,
              name: newUserData.name,
              phone: newUserData.phone,
              userDescription: newUserData.userDescription,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update user on server');
          }

          const updatedServerUser = await response.json();
          // Update local storage with server response
          const finalUserData = {
            ...newUserData,
            id: updatedServerUser.id.toString(),
          };
          localStorage.setItem(`${USER_DATA_PREFIX}${newUserData.email}`, JSON.stringify(finalUserData));
          setUser(finalUserData);
        } catch (err) {
          console.error("Error sincronizando usuario con el servidor", err);
        }
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
