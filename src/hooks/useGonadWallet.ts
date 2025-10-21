"use client";

import { useWallet } from '@/contexts/WalletContext';
import { useWhitelist } from './useWhitelist';

/**
 * Master hook that combines all wallet functionality
 * Use this anywhere in the app for easy wallet operations
 */
export const useGonadWallet = () => {
  const wallet = useWallet();
  const whitelist = useWhitelist();

  return {
    // Wallet connection state
    address: wallet.address,
    isConnected: wallet.isConnected,
    
    // Wallet modal controls
    connectWallet: wallet.openWalletModal,
    closeWalletModal: wallet.closeWalletModal,
    disconnect: wallet.handleDisconnect,
    
    // Signing operations
    signMessage: wallet.signMessage,
    isSigningMessage: wallet.isSigningMessage,
    
    // Whitelist operations
    joinWhitelist: whitelist.joinWhitelist,
    checkWhitelistStatus: whitelist.checkWhitelistStatus,
    isSubmittingWhitelist: whitelist.isSubmitting,
    whitelistError: whitelist.error,
    
    // Note: These convenience values need to be computed async
    // Use checkWhitelistStatus() directly for accurate results
    
    // Convenience display values
    displayAddress: wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : '',
  };
};

export default useGonadWallet;
