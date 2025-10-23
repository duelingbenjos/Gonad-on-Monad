"use client";

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useWhitelist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, jwt } = useAuth();

  const joinWhitelist = useCallback(async (): Promise<boolean> => {
    if (!user?.address || !jwt) {
      setError('Please authenticate first');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Send to backend API with JWT authentication
      const response = await fetch('/api/whitelist', { 
        method: 'POST', 
        body: JSON.stringify({ 
          address: user.address,
          // No need for message/signature - we're using JWT auth
        }), 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        } 
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join whitelist');
        return false;
      }

      // Store success locally for quick access
      localStorage.setItem('gooch_whitelist', JSON.stringify({
        address: user.address,
        timestamp: Date.now(),
        authenticated: true,
        tier: data.data?.tier,
      }));

      return true;
    } catch (err) {
      console.error('Whitelist join error:', err);
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, jwt]);

  const checkWhitelistStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.address) return false;
    
    try {
      // First check localStorage for quick response
      const saved = localStorage.getItem('gooch_whitelist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address?.toLowerCase() === user.address.toLowerCase() && parsed.authenticated) {
          return true;
        }
      }

      // Then check with backend API for authoritative answer
      const response = await fetch(`/api/whitelist?address=${user.address}&collection=gonad`);
      const data = await response.json();
      
      if (response.ok && data.isWhitelisted) {
        // Update localStorage with server data
        localStorage.setItem('gooch_whitelist', JSON.stringify({
          address: user.address,
          timestamp: Date.now(),
          authenticated: true,
          tier: data.data?.tier,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking whitelist status:', error);
      // Fall back to localStorage if API fails
      try {
        const saved = localStorage.getItem('gooch_whitelist');
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.address?.toLowerCase() === user?.address.toLowerCase() && parsed.authenticated;
        }
      } catch {
        // Ignore localStorage errors
      }
      return false;
    }
  }, [user]);

  return {
    joinWhitelist,
    checkWhitelistStatus,
    isSubmitting,
    error,
  };
};
