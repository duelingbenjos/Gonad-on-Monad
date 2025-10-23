"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  address: string;
  // Add more user fields as needed
}

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;
  jwt: string | null;
  
  // Auth operations
  setAuthData: (jwt: string, user: User) => void;
  logout: () => void;
  
  // Utility
  isTokenExpired: (token?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT utility functions
const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

const isJWTExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

const AUTH_STORAGE_KEY = 'gooch_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        if (authData.jwt && authData.user && !isJWTExpired(authData.jwt)) {
          setJwt(authData.jwt);
          setUser(authData.user);
          setIsAuthenticated(true);
        } else {
          // Clean up expired token
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const setAuthData = useCallback((newJwt: string, newUser: User) => {
    if (isJWTExpired(newJwt)) {
      console.error('Attempted to set expired JWT token');
      return;
    }

    setJwt(newJwt);
    setUser(newUser);
    setIsAuthenticated(true);

    // Store in localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        jwt: newJwt,
        user: newUser,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  }, []);

  const logout = useCallback(() => {
    setJwt(null);
    setUser(null);
    setIsAuthenticated(false);
    
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }, []);

  const isTokenExpired = useCallback((token?: string) => {
    const tokenToCheck = token || jwt;
    if (!tokenToCheck) return true;
    return isJWTExpired(tokenToCheck);
  }, [jwt]);

  // Auto-logout on token expiration
  useEffect(() => {
    if (jwt && isJWTExpired(jwt)) {
      logout();
    }
  }, [jwt, logout]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    jwt,
    setAuthData,
    logout,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
