"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';

interface WalletContextType {
  // Modal state
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  
  // Wallet operations
  handleDisconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
  
  // Wallet info
  address: string | undefined;
  isConnected: boolean;
  isSigningMessage: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessage: wagmiSignMessage, isPending: isSigningMessage } = useSignMessage();

  const openWalletModal = useCallback(() => {
    setIsWalletModalOpen(true);
  }, []);

  const closeWalletModal = useCallback(() => {
    setIsWalletModalOpen(false);
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    closeWalletModal();
  }, [disconnect, closeWalletModal]);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!address) return null;
    
    return new Promise((resolve) => {
      wagmiSignMessage(
        { 
          message,
          account: address as `0x${string}` 
        },
        {
          onSuccess: (signature) => {
            resolve(signature);
          },
          onError: (error) => {
            console.error('Signature failed:', error);
            resolve(null);
          }
        }
      );
    });
  }, [address, wagmiSignMessage]);

  const value: WalletContextType = {
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,
    handleDisconnect,
    signMessage,
    address,
    isConnected,
    isSigningMessage,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
