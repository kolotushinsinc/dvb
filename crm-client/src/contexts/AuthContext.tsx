import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const userData = localStorage.getItem('crm_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser) {
          setUser(parsedUser);
          // Verify token is still valid by fetching profile
          authApi.getProfile()
            .then(updatedUser => {
              setUser(updatedUser);
              localStorage.setItem('crm_user', JSON.stringify(updatedUser));
            })
            .catch(error => {
              console.error('Error fetching profile:', error);
              localStorage.removeItem('crm_token');
              localStorage.removeItem('crm_user');
              setUser(null);
            });
        } else {
          localStorage.removeItem('crm_token');
          localStorage.removeItem('crm_user');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await authApi.login(email, password);
      setUser(user);
      localStorage.setItem('crm_token', token);
      localStorage.setItem('crm_user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};