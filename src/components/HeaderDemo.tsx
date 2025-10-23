"use client";

import React from 'react';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Demo component to showcase the new header wallet functionality
 * 
 * Features demonstrated:
 * - Connect wallet button when not authenticated
 * - Truncated wallet address display when connected  
 * - Wallet details modal with whitelist status
 * - Sign out functionality
 * - Responsive design (desktop + mobile burger menu)
 */
export const HeaderDemo: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header with new wallet functionality */}
      <Header />
      
      {/* Demo content */}
      <div className="pt-20 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Header Wallet Integration Demo</h1>
            <p className="text-muted-foreground text-lg">
              The header now includes wallet connection functionality
            </p>
          </div>

          {/* Status Display */}
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Current Status</h2>
            
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">Wallet Connected</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Address: <code className="bg-green-100 px-1 rounded font-mono">{user?.address}</code>
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Click the truncated address in the header to view wallet details and whitelist status.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-700 font-medium">Wallet Not Connected</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Click "Connect Wallet" in the header to get started.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feature List */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Header Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-3">
                <h3 className="font-medium text-primary">Desktop Header</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Connect wallet button when not authenticated</li>
                  <li>• Truncated address display when connected</li>
                  <li>• Click address to view wallet details</li>
                  <li>• Integrated with social icons</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-primary">Mobile Menu</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Wallet status in burger menu</li>
                  <li>• Larger buttons for mobile UX</li>
                  <li>• Menu closes after wallet connection</li>
                  <li>• Maintains navigation flow</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wallet Details Modal Features */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Wallet Details Modal</h2>
            
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">✓</div>
                <div>
                  <strong>Full Wallet Address</strong> - Complete address display with copy functionality
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">✓</div>
                <div>
                  <strong>Whitelist Status</strong> - Real-time check if wallet is whitelisted for Gooch Island
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">✓</div>
                <div>
                  <strong>Quick Actions</strong> - Join whitelist (if not whitelisted) and sign out
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium text-sm">✓</div>
                <div>
                  <strong>Security Info</strong> - Shows JWT authentication status
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Try It Out!</h2>
            <div className="text-left space-y-2 text-sm">
              <p><strong>Desktop:</strong> Look for the "Connect Wallet" button in the top-right corner</p>
              <p><strong>Mobile:</strong> Tap the burger menu (☰) to access wallet functionality</p>
              <p><strong>After Connecting:</strong> Click your truncated address to view details and whitelist status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
