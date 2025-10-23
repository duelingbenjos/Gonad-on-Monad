"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthOperations } from '@/hooks/useAuth';
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

type Stage = 'connect' | 'connected' | 'signing' | 'whitelist' | 'joining' | 'success';

export const WhitelistDialog: React.FC<WhitelistDialogProps> = ({ 
  triggerVariant = 'hero', 
  triggerText = 'Join whitelist' 
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
  
  const { isAuthenticated, user, logout } = useAuth();
  
  const { 
    authenticate, 
    isAuthenticating, 
    error: authError 
  } = useAuthOperations();
  
  const { 
    joinWhitelist, 
    checkWhitelistStatus, 
    isSubmitting, 
    error: whitelistError 
  } = useWhitelist();

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !shouldReopenModal) {
      // Only reset state if this is a real close (not temporary)
      setStage('connect');
      setWaitingForWalletConnection(false);
    } else if (newOpen) {
      // Determine initial stage based on current state
      if (isAuthenticated) {
        // Check if already whitelisted
        const isWhitelisted = await checkWhitelistStatus();
        if (isWhitelisted) {
          setStage('success');
        } else {
          setStage('whitelist');
        }
      } else if (isConnected && address) {
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

  // Monitor authentication state changes
  useEffect(() => {
    if (open && isAuthenticated && (stage === 'signing' || stage === 'connected')) {
      // User just authenticated, check whitelist status
      checkWhitelistStatus().then((isWhitelisted) => {
        if (isWhitelisted) {
          setStage('success');
        } else {
          setStage('whitelist');
        }
      });
    }
  }, [isAuthenticated, stage, open, checkWhitelistStatus]);

  const handleJoinWhitelist = async () => {
    setStage('joining');
    const success = await joinWhitelist();
    if (success) {
      setStage('success');
    } else {
      setStage('whitelist'); // Go back to whitelist stage on failure
    }
  };

  const handleSign = async () => {
    setStage('signing');
    const success = await authenticate();
    if (!success) {
      setStage('connected'); // Go back to connected state on failure
    }
    // Success will be handled by useEffect above
  };

  const handleChangeWallet = async (openConnectModal: () => void) => {
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
  };

  const renderContent = () => {
    switch (stage) {
      case 'connect':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your wallet to join the Gooch Island whitelist
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
        
      case 'connected':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Wallet Connected</h3>
              <p className="text-muted-foreground">
                Sign a message with your wallet to authenticate
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
                      onClick={() => handleChangeWallet(openConnectModal)}
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
            
            {authError && (
              <div className="space-y-3">
                <p className="text-sm text-red-500">{authError}</p>
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
        
      case 'whitelist':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Join the Whitelist</h3>
              <p className="text-muted-foreground">
                You're authenticated! Now join the Gooch Island whitelist.
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Authenticated wallet:</p>
              <div className="mb-3 break-all">
                <p className="font-mono text-xs sm:text-sm leading-relaxed">
                  <span className="inline sm:hidden">
                    {user?.address ? `${user.address.slice(0, 8)}...${user.address.slice(-6)}` : ''}
                  </span>
                  <span className="hidden sm:inline">{user?.address}</span>
                </p>
              </div>
              <Button 
                onClick={async () => {
                  logout(); // Clear authentication
                  handleDisconnect(); // Disconnect wallet
                  
                  // Clear wallet cache to ensure fresh wallet selection
                  try {
                    localStorage.removeItem('wagmi.wallet');
                    localStorage.removeItem('wagmi.store');
                    localStorage.removeItem('wagmi.cache');
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('rainbow') || key.startsWith('wagmi')) {
                        localStorage.removeItem(key);
                      }
                    });
                  } catch (error) {
                    console.warn('Could not clear wallet cache:', error);
                  }
                  
                  setStage('connect'); // Reset to beginning
                }}
                variant="outline"
                size="sm"
                className="text-xs w-full sm:w-auto"
              >
                <span className="hidden xs:inline">Sign Out & Change Wallet</span>
                <span className="xs:hidden">Sign Out & Change</span>
              </Button>
            </div>
            
            <Button 
              onClick={handleJoinWhitelist} 
              disabled={false}
              className="w-full"
              variant="hero"
              size="lg"
            >
              Join Whitelist
            </Button>
            
            {whitelistError && (
              <p className="text-sm text-red-500">{whitelistError}</p>
            )}
            
            <p className="text-xs text-muted-foreground">
              This will add your wallet to the Gooch Island whitelist
            </p>
          </div>
        );
        
      case 'joining':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Joining Whitelist</h3>
              <p className="text-muted-foreground">
                Adding your wallet to the whitelist...
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Wallet:</p>
              <div className="mb-3 break-all">
                <p className="font-mono text-xs sm:text-sm leading-relaxed">
                  <span className="inline sm:hidden">
                    {user?.address ? `${user.address.slice(0, 8)}...${user.address.slice(-6)}` : ''}
                  </span>
                  <span className="hidden sm:inline">{user?.address}</span>
                </p>
              </div>
              <Button 
                onClick={async () => {
                  logout(); // Clear authentication
                  handleDisconnect(); // Disconnect wallet
                  
                  // Clear wallet cache to ensure fresh wallet selection
                  try {
                    localStorage.removeItem('wagmi.wallet');
                    localStorage.removeItem('wagmi.store');
                    localStorage.removeItem('wagmi.cache');
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('rainbow') || key.startsWith('wagmi')) {
                        localStorage.removeItem(key);
                      }
                    });
                  } catch (error) {
                    console.warn('Could not clear wallet cache:', error);
                  }
                  
                  setStage('connect'); // Reset to beginning
                }}
                variant="outline"
                size="sm"
                className="text-xs w-full sm:w-auto"
                disabled={isSubmitting} // Disable while operation is in progress
              >
                <span className="hidden xs:inline">Cancel & Change Wallet</span>
                <span className="xs:hidden">Cancel & Change</span>
              </Button>
            </div>
            
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            
            {whitelistError && (
              <div className="space-y-3">
                <p className="text-sm text-red-500">{whitelistError}</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button 
                    onClick={() => setStage('whitelist')}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={async () => {
                      logout();
                      handleDisconnect();
                      
                      // Clear wallet cache to ensure fresh wallet selection
                      try {
                        localStorage.removeItem('wagmi.wallet');
                        localStorage.removeItem('wagmi.store');
                        localStorage.removeItem('wagmi.cache');
                        Object.keys(localStorage).forEach(key => {
                          if (key.startsWith('rainbow') || key.startsWith('wagmi')) {
                            localStorage.removeItem(key);
                          }
                        });
                      } catch (error) {
                        console.warn('Could not clear wallet cache:', error);
                      }
                      
                      setStage('connect');
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <span className="hidden xs:inline">Change Wallet</span>
                    <span className="xs:hidden">Change</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-4">
              {/* GONAD Diamond Logo */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                  {/* Diamond-shaped container */}
                  <div className="absolute inset-0 rotate-45 overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400/30 to-yellow-600/30 backdrop-blur-sm border border-yellow-400/50"
                       style={{ boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)' }}>
                    <div className="absolute inset-0 -rotate-45 flex items-center justify-center">
                      <img 
                        src="/gonad.png" 
                        alt="GONAD Success" 
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain"
                      />
                    </div>
                  </div>
                  {/* Outer glow effect */}
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-lg blur-md -z-10 rotate-45" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-primary">You're on the list!</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Welcome to Gooch Island. We'll notify you when minting opens.
                </p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Whitelisted wallet:</p>
              <div className="break-all">
                <p className="font-mono text-xs sm:text-sm leading-relaxed">
                  <span className="inline sm:hidden">
                    {user?.address ? `${user.address.slice(0, 8)}...${user.address.slice(-6)}` : ''}
                  </span>
                  <span className="hidden sm:inline">{user?.address}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-medium">Stay connected with us:</p>
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://x.com/gooch_air', '_blank')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <XIcon size={14} />
                  <span className="hidden xs:inline">Follow on X</span>
                  <span className="xs:hidden">X</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://farcaster.xyz/goochisland', '_blank')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <FarcasterIcon size={14} />
                  <span className="hidden xs:inline">Farcaster</span>
                  <span className="xs:hidden">FC</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://discord.gg/TPPr6RQGZz', '_blank')}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <DiscordIcon size={14} />
                  <span className="hidden xs:inline">Discord</span>
                  <span className="xs:hidden">DC</span>
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
        <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Join the Whitelist</DialogTitle>
          </DialogHeader>
          <div className="px-1 sm:px-0">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};