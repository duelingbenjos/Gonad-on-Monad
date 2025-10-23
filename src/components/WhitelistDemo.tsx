"use client";

import React from 'react';
import { WhitelistDialog } from '@/components/WhitelistDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useWhitelist } from '@/hooks/useWhitelist';
import { Button } from '@/components/ui/button';

/**
 * Demo component showing the new integrated whitelist flow
 * 
 * Flow:
 * 1. Click "Join Whitelist" → Opens modal
 * 2. If not authenticated → Shows WalletSignIn component
 * 3. User connects wallet and signs message → Gets JWT
 * 4. Shows "Join Whitelist" button → User clicks to join
 * 5. Success state with social links
 */
export const WhitelistDemo: React.FC = () => {
  const { isAuthenticated, user, jwt, logout } = useAuth();
  const { checkWhitelistStatus } = useWhitelist();
  const [isWhitelisted, setIsWhitelisted] = React.useState<boolean | null>(null);

  // Check whitelist status when authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      checkWhitelistStatus().then(setIsWhitelisted);
    } else {
      setIsWhitelisted(null);
    }
  }, [isAuthenticated, user, checkWhitelistStatus]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Gooch Island Whitelist</h2>
        <p className="text-muted-foreground">
          New integrated authentication flow demo
        </p>
      </div>

      {/* Authentication Status */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Authentication Status</h3>
        
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">Authenticated</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Address: <code className="bg-green-100 px-1 rounded">{user?.address}</code>
              </p>
              <p className="text-sm text-green-600">
                JWT: <code className="bg-green-100 px-1 rounded text-xs">{jwt?.substring(0, 30)}...</code>
              </p>
            </div>
            
            <Button onClick={logout} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-700 font-medium">Not Authenticated</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Sign in with your wallet to join the whitelist
            </p>
          </div>
        )}
      </div>

      {/* Whitelist Status */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Whitelist Status</h3>
        
        {isAuthenticated ? (
          isWhitelisted === null ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Checking whitelist status...</span>
              </div>
            </div>
          ) : isWhitelisted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-medium">✅ You're whitelisted!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Welcome to Gooch Island. You'll be notified when minting opens.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 font-medium">Ready to join whitelist</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                You're authenticated but not yet whitelisted. Join now!
              </p>
            </div>
          )
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">Authentication required</span>
            </div>
          </div>
        )}
      </div>

      {/* Whitelist Actions */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">Actions</h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Join Whitelist (New Flow)</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Uses the new integrated authentication system with JWT tokens
            </p>
            <WhitelistDialog triggerVariant="hero" triggerText="Join Whitelist" />
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Different Button Styles</h4>
            <div className="flex flex-wrap gap-3">
              <WhitelistDialog triggerVariant="default" triggerText="Default Style" />
              <WhitelistDialog triggerVariant="outline" triggerText="Outline Style" />
            </div>
          </div>
        </div>
      </div>

      {/* Flow Explanation */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold">How The New Flow Works</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">1</div>
            <div>
              <strong>Click "Join Whitelist"</strong> - Opens the whitelist modal
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">2</div>
            <div>
              <strong>Authentication Required</strong> - If not signed in, shows wallet sign-in component
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">3</div>
            <div>
              <strong>Connect & Sign</strong> - User connects wallet and signs authentication message
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">4</div>
            <div>
              <strong>Get JWT Token</strong> - Server validates signature and returns JWT for authenticated sessions
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">5</div>
            <div>
              <strong>Join Whitelist</strong> - Shows "Join Whitelist" button, uses JWT for API authentication
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-medium">✓</div>
            <div>
              <strong>Success!</strong> - User is whitelisted and sees social media links
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
