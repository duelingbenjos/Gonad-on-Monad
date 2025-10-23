"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthOperations = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, signMessage } = useWallet();
  const { setAuthData } = useAuth();

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!address) {
      setError('No wallet connected');
      return false;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // Create authentication message
      const message = `Sign in to Gooch Island

Wallet: ${address}
Timestamp: ${new Date().toISOString()}

This signature is used for authentication and doesn't cost any gas.`;

      const signature = await signMessage(message);
      
      if (!signature) {
        setError('Signature failed or was cancelled');
        return false;
      }

      // Send to backend API
      const response = await fetch('/api/auth', { 
        method: 'POST', 
        body: JSON.stringify({ 
          address, 
          message,
          signature 
        }), 
        headers: { 'Content-Type': 'application/json' } 
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        return false;
      }

      // Store JWT and user data in AuthContext
      setAuthData(data.jwt, data.user);

      return true;
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, signMessage, setAuthData]);

  return {
    authenticate,
    isAuthenticating,
    error,
  };
};
