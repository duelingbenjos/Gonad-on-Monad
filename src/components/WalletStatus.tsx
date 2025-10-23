"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WalletSignIn } from '@/components/WalletSignIn';
import { useAuth } from '@/contexts/AuthContext';
import { useWhitelist } from '@/hooks/useWhitelist';
import { CheckCircle, XCircle, Wallet, LogOut } from 'lucide-react';

interface WalletStatusProps {
  variant?: 'header' | 'mobile';
  onMenuClose?: () => void;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ 
  variant = 'header', 
  onMenuClose 
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [checkingWhitelist, setCheckingWhitelist] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();
  const { checkWhitelistStatus } = useWhitelist();

  // Check whitelist status when authenticated
  useEffect(() => {
    if (isAuthenticated && user && detailsOpen) {
      setCheckingWhitelist(true);
      checkWhitelistStatus().then((status) => {
        setIsWhitelisted(status);
        setCheckingWhitelist(false);
      });
    }
  }, [isAuthenticated, user, detailsOpen, checkWhitelistStatus]);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSignOut = () => {
    logout();
    setDetailsOpen(false);
    if (onMenuClose) onMenuClose();
  };

  const handleDetailsClose = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) {
      setIsWhitelisted(null); // Reset whitelist status when closing
    }
  };

  if (!isAuthenticated) {
    return (
      <WalletSignIn
        triggerVariant={variant === 'mobile' ? 'outline' : 'default'}
        triggerText="Connect Wallet"
        triggerSize={variant === 'mobile' ? 'lg' : 'sm'}
        onAuthSuccess={() => {
          if (onMenuClose) onMenuClose();
        }}
      />
    );
  }

  return (
    <>
      <Button
        onClick={() => setDetailsOpen(true)}
        variant={variant === 'mobile' ? 'outline' : 'ghost'}
        size={variant === 'mobile' ? 'lg' : 'sm'}
        className={`font-mono ${variant === 'mobile' ? 'text-lg' : 'text-sm'} flex items-center gap-2`}
      >
        <Wallet className={`${variant === 'mobile' ? 'h-5 w-5' : 'h-4 w-4'}`} />
        {truncateAddress(user?.address || '')}
      </Button>

      <Dialog open={detailsOpen} onOpenChange={handleDetailsClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Wallet Address */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Connected Wallet</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-mono text-sm break-all">{user?.address}</p>
              </div>
            </div>

            {/* Whitelist Status */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Whitelist Status</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                {checkingWhitelist ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Checking status...</span>
                  </div>
                ) : isWhitelisted === null ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Status unknown</span>
                  </div>
                ) : isWhitelisted ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Whitelisted for Gooch Island</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Not whitelisted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!isWhitelisted && isWhitelisted !== null && (
                <Button 
                  onClick={() => {
                    setDetailsOpen(false);
                    if (onMenuClose) onMenuClose();
                    // Note: User would need to manually trigger whitelist dialog
                  }}
                  variant="hero" 
                  className="w-full"
                >
                  Join Whitelist
                </Button>
              )}
              
              <Button 
                onClick={handleSignOut}
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {/* Additional Info */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
