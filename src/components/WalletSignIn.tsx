"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthOperations } from '@/hooks/useAuth';

interface WalletSignInProps {
  // Trigger customization
  triggerVariant?: 'hero' | 'outline' | 'default';
  triggerText?: string;
  triggerSize?: 'sm' | 'default' | 'lg' | 'xl';
  
  // Behavior
  autoClose?: boolean; // Close dialog on successful auth
  
  // Callbacks (optional, since component updates global auth state)
  onAuthSuccess?: (user: any, jwt: string) => void;
  onAuthFailure?: (error: string) => void;
}

type Stage = 'connect' | 'connected' | 'signing' | 'authenticated';

export const WalletSignIn: React.FC<WalletSignInProps> = ({ 
  triggerVariant = 'default', 
  triggerText = 'Sign In',
  triggerSize = 'default',
  autoClose = true,
  onAuthSuccess,
  onAuthFailure
}) => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('connect');
  const [waitingForWalletConnection, setWaitingForWalletConnection] = useState(false);
  const [shouldReopenModal, setShouldReopenModal] = useState(false);
  
  const { 
    address, 
    isConnected, 
    handleDisconnect,
    isSigningMessage 
  } = useWallet();
  
  const { isAuthenticated, user, jwt } = useAuth();
  
  const { 
    authenticate, 
    isAuthenticating, 
    error 
  } = useAuthOperations();

  // Don't show sign in if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !shouldReopenModal) {
      // Only reset state if this is a real close (not temporary)
      setStage('connect');
      setWaitingForWalletConnection(false);
    } else if (newOpen) {
      // Determine initial stage based on wallet connection
      if (isConnected && address) {
        setStage('connected');
      } else {
        setStage('connect');
      }
    }
  };

  const handleOpenWalletModal = (openConnectModal: () => void) => {
    setWaitingForWalletConnection(true);
    setShouldReopenModal(true);
    setOpen(false); // Close temporarily to allow RainbowKit interaction
    
    // Open RainbowKit after a brief delay
    setTimeout(() => {
      openConnectModal();
    }, 50);
    
    // Set up a fallback to reopen if nothing happens within 10 seconds
    setTimeout(() => {
      if (shouldReopenModal) {
        setShouldReopenModal(false);
        setWaitingForWalletConnection(false);
        setOpen(true);
      }
    }, 10000);
  };

  // Monitor wallet connection to auto-advance stages
  useEffect(() => {
    if (isConnected && address && waitingForWalletConnection && shouldReopenModal) {
      setWaitingForWalletConnection(false);
      setShouldReopenModal(false);
      setStage('connected');
      setOpen(true); // Reopen the modal
    }
  }, [isConnected, address, waitingForWalletConnection, shouldReopenModal]);

  // Handle when RainbowKit closes without connection (user cancels)
  useEffect(() => {
    if (shouldReopenModal && !isConnected && !waitingForWalletConnection) {
      // If we're waiting to reopen but no connection happened, reopen anyway
      const timer = setTimeout(() => {
        if (shouldReopenModal) {
          setShouldReopenModal(false);
          setOpen(true);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldReopenModal, isConnected, waitingForWalletConnection]);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated && user && jwt && stage === 'signing') {
      setStage('authenticated');
      if (onAuthSuccess) {
        onAuthSuccess(user, jwt);
      }
      if (autoClose) {
        setTimeout(() => {
          setOpen(false);
        }, 2000); // Auto-close after 2 seconds
      }
    }
  }, [isAuthenticated, user, jwt, stage, onAuthSuccess, autoClose]);

  // Handle authentication errors
  useEffect(() => {
    if (error && onAuthFailure) {
      onAuthFailure(error);
    }
  }, [error, onAuthFailure]);

  const handleSign = async () => {
    setStage('signing');
    const success = await authenticate();
    if (!success) {
      setStage('connected'); // Go back to connected state on failure
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'connect':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to sign in to Gooch Island
              </p>
            </div>
            
            <div className="flex justify-center">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openConnectModal,
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
                          variant={triggerVariant}
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
        
      case 'connected':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Wallet Connected</h3>
              <p className="text-muted-foreground">
                Sign a message to authenticate with your wallet
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Connected wallet:</p>
              <div className="mb-3 break-all">
                <p className="font-mono text-xs sm:text-sm leading-relaxed">
                  <span className="inline sm:hidden">
                    {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
                  </span>
                  <span className="hidden sm:inline">{address}</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={handleSign}
                  variant="hero"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Sign In
                </Button>
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button 
                      onClick={async () => {
                        // Fully disconnect first
                        handleDisconnect();
                        
                        // Wait a moment for disconnection to complete
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Clear any localStorage wallet connection cache
                        try {
                          localStorage.removeItem('wagmi.wallet');
                          localStorage.removeItem('wagmi.store');
                          localStorage.removeItem('wagmi.cache');
                          // Clear RainbowKit specific storage
                          Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('rainbow') || key.startsWith('wagmi')) {
                              localStorage.removeItem(key);
                            }
                          });
                        } catch (error) {
                          console.warn('Could not clear wallet cache:', error);
                        }
                        
                        // Force open the full wallet selection dialog
                        handleOpenWalletModal(openConnectModal);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden xs:inline">Change Wallet</span>
                      <span className="xs:hidden">Change</span>
                    </Button>
                  )}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
        );
        
      case 'signing':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Signing Message</h3>
              <p className="text-muted-foreground">
                Please sign the message in your wallet to authenticate
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Wallet:</p>
              <div className="break-all">
                <p className="font-mono text-xs sm:text-sm leading-relaxed">
                  <span className="inline sm:hidden">
                    {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
                  </span>
                  <span className="hidden sm:inline">{address}</span>
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            
            {error && (
              <div className="space-y-3">
                <p className="text-sm text-red-500">{error}</p>
                <Button 
                  onClick={() => setStage('connected')}
                  variant="outline"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              This signature is free and doesn't send a transaction
            </p>
          </div>
        );
        
      case 'authenticated':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-primary">Welcome!</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  You're now signed in to Gooch Island
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Authenticated as:</p>
              <div className="break-all">
                <p className="font-mono text-xs sm:text-sm leading-relaxed">
                  <span className="inline sm:hidden">
                    {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : ''}
                  </span>
                  <span className="hidden sm:inline">{address}</span>
                </p>
              </div>
            </div>
            
            {!autoClose && (
              <Button 
                onClick={() => setOpen(false)}
                variant="hero"
                className="w-full"
              >
                Continue
              </Button>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Sign In</DialogTitle>
        </DialogHeader>
        <div className="px-1 sm:px-0">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
