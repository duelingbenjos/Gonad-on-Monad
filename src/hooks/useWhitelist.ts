"use client";

import { useState, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';

export const useWhitelist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, signMessage } = useWallet();

  const joinWhitelist = useCallback(async (): Promise<boolean> => {
    if (!address) {
      setError('No wallet connected');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const message = `Gonad on Monad whitelist confirmation

Wallet: ${address}
Timestamp: ${new Date().toISOString()}`;

      const signature = await signMessage(message);
      
      if (!signature) {
        setError('Signature failed or was cancelled');
        return false;
      }

      // Send to backend API
      const response = await fetch('/api/whitelist', { 
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
        setError(data.error || 'Failed to join whitelist');
        return false;
      }

      // Store success locally for quick access
      localStorage.setItem('gooch_whitelist', JSON.stringify({
        address,
        timestamp: Date.now(),
        signature: true,
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
  }, [address, signMessage]);

  const checkWhitelistStatus = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    
    try {
      // First check localStorage for quick response
      const saved = localStorage.getItem('gooch_whitelist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.address?.toLowerCase() === address.toLowerCase() && parsed.signature) {
          return true;
        }
      }

      // Then check with backend API for authoritative answer
      const response = await fetch(`/api/whitelist?address=${address}&collection=gonad`);
      const data = await response.json();
      
      if (response.ok && data.isWhitelisted) {
        // Update localStorage with server data
        localStorage.setItem('gooch_whitelist', JSON.stringify({
          address,
          timestamp: Date.now(),
          signature: true,
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
          return parsed.address?.toLowerCase() === address.toLowerCase() && parsed.signature;
        }
      } catch {
        // Ignore localStorage errors
      }
      return false;
    }
  }, [address]);

  return {
    joinWhitelist,
    checkWhitelistStatus,
    isSubmitting,
    error,
  };
};
