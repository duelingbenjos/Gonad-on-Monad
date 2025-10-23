"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { WalletSignIn } from '@/components/WalletSignIn';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Example component demonstrating how to use the new authentication system
 * 
 * Usage examples:
 * 
 * 1. Basic sign-in button:
 * <WalletSignIn />
 * 
 * 2. Custom styled sign-in:
 * <WalletSignIn 
 *   triggerVariant="hero" 
 *   triggerText="Authenticate" 
 *   triggerSize="lg"
 * />
 * 
 * 3. With callbacks:
 * <WalletSignIn 
 *   onAuthSuccess={(user, jwt) => console.log('Authenticated:', user)}
 *   onAuthFailure={(error) => console.error('Auth failed:', error)}
 *   autoClose={false}
 * />
 */
export const AuthExample: React.FC = () => {
  const { isAuthenticated, user, jwt, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="space-y-4 p-6 border rounded-lg">
        <h3 className="text-lg font-semibold text-green-600">✅ Authenticated</h3>
        
        <div className="space-y-2">
          <p><strong>Address:</strong> <code className="text-sm bg-muted p-1 rounded">{user?.address}</code></p>
          <p><strong>JWT:</strong> <code className="text-xs bg-muted p-1 rounded break-all">{jwt?.substring(0, 50)}...</code></p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Example API Usage:</h4>
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Using the JWT token in API calls
const response = await fetch('/api/protected-endpoint', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${jwt}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ data: 'your-data' })
});`}
          </pre>
        </div>
        
        <Button onClick={logout} variant="outline">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">🔐 Authentication Required</h3>
      <p className="text-muted-foreground">
        Sign in with your wallet to access authenticated features.
      </p>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <h4 className="font-medium">Different Sign-In Button Styles:</h4>
          <div className="flex flex-wrap gap-3">
            <WalletSignIn />
            <WalletSignIn triggerVariant="hero" triggerText="Hero Style" />
            <WalletSignIn triggerVariant="outline" triggerText="Outline Style" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">With Custom Callbacks:</h4>
          <WalletSignIn 
            triggerVariant="default"
            triggerText="Sign In (with callbacks)"
            onAuthSuccess={(user, jwt) => {
              console.log('🎉 Authentication successful!', { user, jwt });
              // You can trigger additional logic here
            }}
            onAuthFailure={(error) => {
              console.error('❌ Authentication failed:', error);
              // Handle auth failure
            }}
            autoClose={false} // Keep dialog open to see success state
          />
        </div>
      </div>
    </div>
  );
};
