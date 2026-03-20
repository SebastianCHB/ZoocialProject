import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';
import { User, authService } from '../services/auth';

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await storage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          try {
            // Restore user session from the server using the stored token
            const userData = await authService.getUser();
            setUser(userData);
          } catch (e) {
            // Token is invalid or expired — clear it
            console.log('Token inválido o expirado, limpiando sesión', e);
            await storage.deleteItem('auth_token');
            setToken(null);
          }
        }
      } catch (e) {
        console.error('Failed to load auth', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const signIn = async (newToken: string, newUser: User) => {
    await storage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const signOut = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      await storage.deleteItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
