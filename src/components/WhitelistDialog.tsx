"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RefreshCw } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useWhitelist } from '@/hooks/useWhitelist';

// Custom SVG Icons to match SocialIcons component
const XIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const DiscordIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
  </svg>
);

const FarcasterIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21.5 5.2c0-1.4-1.1-2.5-2.5-2.5S16.5 3.8 16.5 5.2v13.6c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V5.2zM7.5 5.2c0-1.4-1.1-2.5-2.5-2.5S2.5 3.8 2.5 5.2v13.6c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V5.2zM14.5 8.7c0-.8-.7-1.5-1.5-1.5h-2c-.8 0-1.5.7-1.5 1.5v6.6c0 .8.7 1.5 1.5 1.5h2c.8 0 1.5-.7 1.5-1.5V8.7z"/>
    <path d="M19 13.5h-2.5v-3H19c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5zM7.5 10.5H5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5h2.5v-3z"/>
  </svg>
);

interface WhitelistDialogProps {
  triggerVariant?: 'hero' | 'outline' | 'default';
  triggerText?: string;
}

type Stage = 'connect' | 'sign' | 'success';

export const WhitelistDialog: React.FC<WhitelistDialogProps> = ({ 
  triggerVariant = 'hero', 
  triggerText = 'Join whitelist' 
}) => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('connect');
  const [waitingForWalletConnection, setWaitingForWalletConnection] = useState(false);
  
  const { 
    address, 
    isConnected, 
    openWalletModal, 
    closeWalletModal,
    handleDisconnect,
    isSigningMessage 
  } = useWallet();
  
  const { 
    joinWhitelist, 
    checkWhitelistStatus, 
    isSubmitting, 
    error 
  } = useWhitelist();

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStage('connect');
      setWaitingForWalletConnection(false); // Reset waiting flag when dialog closes
    } else {
      // Always start at connect stage - let user choose to proceed with existing wallet
      setStage('connect');
    }
  };

  const handleOpenWalletModal = (openConnectModal: () => void) => {
    // Set flag that we're waiting for wallet connection
    setWaitingForWalletConnection(true);
    // Close our dialog temporarily to avoid z-index issues
    setOpen(false);
    // Small delay to ensure our dialog closes first
    setTimeout(() => {
      openConnectModal();
    }, 100);
  };

  // Monitor wallet connection to auto-advance stages or reopen dialog
  useEffect(() => {
    if (isConnected && address && waitingForWalletConnection) {
      if (!open) {
        // If dialog was closed for wallet connection, reopen it
        setTimeout(() => {
          setOpen(true);
          setWaitingForWalletConnection(false); // Reset flag
          // Always start at connect stage and let user choose what to do
          setStage('connect');
        }, 300);
      } else if (open) {
        // If dialog is already open, stay at connect stage
        setWaitingForWalletConnection(false); // Reset flag
        setStage('connect');
      }
    }
  }, [isConnected, address, waitingForWalletConnection, open, checkWhitelistStatus]);

  const handleSign = async () => {
    const success = await joinWhitelist();
    if (success) {
      setStage('success');
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'connect':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {isConnected ? 'Choose Your Wallet' : 'Connect Your Wallet'}
              </h3>
              <p className="text-muted-foreground">
                {isConnected 
                  ? 'You can continue with your current wallet, change wallets, or connect a different one'
                  : 'Connect your wallet to join the Gooch Island whitelist'
                }
              </p>
            </div>
            
            {isConnected && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Currently connected:</p>
                <p className="font-mono text-sm break-all mb-3">{address}</p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={async () => {
                      // Check if already whitelisted when continuing
                      const isWhitelisted = await checkWhitelistStatus();
                      if (isWhitelisted) {
                        setStage('success');
                      } else {
                        setStage('sign');
                      }
                    }} 
                    variant="hero"
                    size="sm"
                  >
                    Continue with this wallet
                  </Button>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button 
                        onClick={() => {
                          setWaitingForWalletConnection(true);
                          handleDisconnect();
                          // Small delay to ensure disconnect completes
                          setTimeout(() => {
                            handleOpenWalletModal(openConnectModal);
                          }, 100);
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Change Wallet
                      </Button>
                    )}
                  </ConnectButton.Custom>
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
                          onClick={() => handleOpenWalletModal(openConnectModal)} 
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
        );
        
      case 'sign':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Sign to Join Whitelist</h3>
              <p className="text-muted-foreground">
                Sign a message to prove ownership of your wallet
              </p>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Connected wallet:</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            
            <Button 
              onClick={handleSign} 
              disabled={isSubmitting || isSigningMessage}
              className="w-full"
              variant="hero"
            >
              {isSubmitting || isSigningMessage ? 'Signing...' : 'Sign Message'}
            </Button>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              This signature is free and doesn't send a transaction
            </p>
          </div>
        );
        
      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              {/* GONAD Diamond Logo */}
              <div className="flex justify-center mb-6">
                <div className="relative w-24 h-24">
                  {/* Diamond-shaped container */}
                  <div className="absolute inset-0 rotate-45 overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-sm border border-yellow-400/50"
                       style={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)' }}>
                    <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                      <img 
                        src="/gonad.png" 
                        alt="GONAD Success" 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </div>
                  {/* Outer glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg blur-md -z-10 rotate-45" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-primary">You're on the list!</h3>
                <p className="text-muted-foreground">
                  Welcome to Gooch Island. We'll notify you when minting opens.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium">Stay connected with us:</p>
              
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://x.com/gooch_air', '_blank')}
                  className="flex items-center gap-2"
                >
                  <XIcon size={16} />
                  Follow on X
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://farcaster.xyz/goochisland', '_blank')}
                  className="flex items-center gap-2"
                >
                  <FarcasterIcon size={16} />
                  Farcaster
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://discord.gg/TPPr6RQGZz', '_blank')}
                  className="flex items-center gap-2"
                >
                  <DiscordIcon size={16} />
                  Discord
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={() => setOpen(false)}
              variant="hero"
              className="w-full"
            >
              Done
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant={triggerVariant} size="xl">{triggerText}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join the Whitelist</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};