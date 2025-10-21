"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RefreshCw } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface WalletConnectionModalProps {
  title?: string;
  description?: string;
  onConnected?: (address: string) => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  title = "Connect Your Wallet",
  description = "Connect your wallet to continue",
  onConnected,
}) => {
  const {
    isWalletModalOpen,
    closeWalletModal,
    handleDisconnect,
    address,
    isConnected,
  } = useWallet();

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address && onConnected) {
      onConnected(address);
    }
  }, [isConnected, address, onConnected]);

  const handleWalletModal = (openConnectModal: () => void) => {
    // Close our dialog temporarily to avoid z-index issues
    closeWalletModal();
    // Small delay to ensure our dialog closes first
    setTimeout(() => {
      openConnectModal();
    }, 100);
  };

  const handleChangeWallet = () => {
    handleDisconnect();
  };

  return (
    <Dialog open={isWalletModalOpen} onOpenChange={closeWalletModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isConnected ? 'Wallet Connected' : 'Choose Your Wallet'}
            </h3>
            <p className="text-muted-foreground">
              {isConnected 
                ? 'You can continue with your current wallet or choose a different one'
                : description
              }
            </p>
          </div>
          
          {isConnected && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Currently connected:</p>
              <p className="font-mono text-sm break-all mb-3">{address}</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={closeWalletModal}
                  variant="hero"
                  size="sm"
                >
                  Continue with this wallet
                </Button>
                <Button 
                  onClick={handleChangeWallet}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Change Wallet
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                connectModalOpen,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {!connected && (
                      <Button 
                        onClick={() => handleWalletModal(openConnectModal)} 
                        variant="hero"
                        size="lg"
                        className="min-w-[200px]"
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
