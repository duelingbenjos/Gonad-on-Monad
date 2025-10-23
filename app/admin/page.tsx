'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChainId } from 'wagmi';
import { useWallet } from '@/contexts/WalletContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';

// Window.ethereum types are provided by Web3 libraries (@rainbow-me/rainbowkit, wagmi, viem)

interface AdminUser {
  address: string;
  userType: 'ADMIN' | 'USER';
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { address, isConnected, signMessage, isSigningMessage, handleDisconnect } = useWallet();
  const chainId = useChainId();

  // Debug wagmi state
  console.log('🔧 Wagmi State:', {
    address,
    isConnected,
    chainId,
    isSigningMessage,
    hasSignMessage: !!signMessage
  });
  
  const [loginMessage, setLoginMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [envDebug, setEnvDebug] = useState<any>(null);

  // Ensure we're on the client side before accessing localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Fetch environment debug info
    fetch('/api/admin/debug')
      .then(res => res.json())
      .then(data => setEnvDebug(data))
      .catch(err => console.error('Failed to fetch env debug:', err));
  }, []);

  // Check for existing auth token on component mount
  useEffect(() => {
    if (!isClient) return;
    
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AdminUser;
        setAdminUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
  }, [isClient]);

  // Fetch login message when wallet connects
  useEffect(() => {
    if (isClient && isConnected && address && !isLoggedIn) {
      // Reset error state when wallet changes
      setError('');
      fetchLoginMessage();
    } else if (!isConnected) {
      // Clear login message and errors when wallet disconnects
      setLoginMessage('');
      setError('');
    }
    
    // Auto-clear previous errors when connection state changes
    if (isConnected && error.includes('Signing failed:')) {
      setError('');
    }
  }, [isClient, isConnected, address, isLoggedIn, error]);

  const fetchLoginMessage = async () => {
    try {
      const response = await fetch('/api/admin/login');
      const data = await response.json();
      
      if (data.message) {
        setLoginMessage(data.message);
      } else {
        setError('Failed to generate login message');
      }
    } catch (err) {
      setError('Failed to fetch login message');
    }
  };

  const handleLogin = async () => {
    if (!address || !loginMessage) {
      setError('Wallet not connected or login message not available');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Starting admin login process...');
      console.log('📝 Wallet address:', address);
      console.log('💬 Message to sign:', loginMessage);
      console.log('🔗 Connected?', isConnected);
      console.log('⏳ Currently signing?', isSigningMessage);

      // Sign the login message
      console.log('📝 About to call signMessage...');
      
      // Check if signMessage function exists
      if (!signMessage) {
        throw new Error('signMessage hook is not available - wallet may not be properly connected');
      }
      
      let signature;
      
      try {
        signature = await signMessage(loginMessage);
        console.log('✍️ signMessage completed, signature length:', signature?.length);
      } catch (signError) {
        console.error('💥 signMessage error:', signError);
        throw new Error(`Signing failed: ${signError.message || 'Unknown signing error'}`);
      }
      
      console.log('✍️ Signature received:', signature ? 'Yes' : 'No');
      
      if (!signature) {
        throw new Error('Signature was cancelled or failed');
      }

      console.log('🌐 Sending login request to server...');

      // Send login request
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          message: loginMessage,
          signature,
        }),
      });

      console.log('📡 Server response status:', response.status);
      
      const result = await response.json();
      console.log('📦 Server response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Store auth token and user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', result.token);
        localStorage.setItem('admin_user', JSON.stringify(result.user));
      }
      
      setAdminUser(result.user);
      setIsLoggedIn(true);
      
      console.log('✅ Login successful, redirecting...');
      
      // Redirect to admin dashboard after short delay
      setTimeout(() => {
        router.push('/admin/content');
      }, 1000);

    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    }
    setAdminUser(null);
    setIsLoggedIn(false);
    setLoginMessage('');
  };

  // Test function to check if signing works at all
  const testSigning = async () => {
    try {
      console.log('🧪 Testing signature capability...');
      console.log('🔧 Wagmi signing state:', {
        isConnected,
        address,
        hasSignMessage: !!signMessage,
        isSigningMessage,
        // signError removed - now using WalletContext
      });
      
      // Check if window.ethereum exists
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log('🌐 window.ethereum detected:', {
          isMetaMask: window.ethereum.isMetaMask,
          selectedAddress: window.ethereum.selectedAddress,
          chainId: window.ethereum.chainId
        });
      }
      
      const testMessage = 'Test message';
      console.log('📝 Calling signMessage with:', testMessage);
      
      // Check if signMessage function exists
      if (!signMessage) {
        throw new Error('signMessage hook is not available');
      }
      
      const testSig = await signMessage(testMessage);
      
      console.log('✅ Test signing result:', {
        hasSignature: !!testSig,
        signatureLength: testSig?.length,
        signature: testSig ? testSig.slice(0, 20) + '...' : 'null'
      });
      
      if (testSig) {
        setError('Test signing successful! ✅');
      } else {
        setError('Test signing returned null/undefined ❌');
      }
    } catch (testError) {
      console.error('❌ Test signing failed:', testError);
      setError(`Test signing failed: ${testError.message || 'Unknown error'}`);
    }
  };

  // Direct wallet signing test (bypass wagmi)
  const testDirectSigning = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        setError('No wallet detected ❌');
        return;
      }
      
      console.log('🔗 Testing direct wallet signing...');
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('👛 Accounts:', accounts);
      
      const message = 'Direct test message';
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, accounts[0]]
      });
      
      console.log('✍️ Direct signature:', signature);
      setError('Direct signing successful! ✅');
      
    } catch (directError) {
      console.error('❌ Direct signing failed:', directError);
      setError(`Direct signing failed: ${directError.message}`);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/admin/content');
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (isLoggedIn && adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-white">Admin Access Granted</CardTitle>
            <CardDescription className="text-gray-400">
              Welcome to the Gonad admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">Logged in as:</p>
              <p className="text-sm font-mono text-white bg-gray-700 p-2 rounded">
                {adminUser.address}
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleGoToDashboard}
                className="w-full"
              >
                Go to Content Dashboard
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-white">Admin Login</CardTitle>
          <CardDescription className="text-gray-400">
            Connect your admin wallet to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Debug Info */}
          {envDebug && (
            <div className="bg-gray-700 p-3 rounded text-xs">
              <p className="font-semibold text-white mb-2">🔧 Configuration Status:</p>
              <div className="space-y-1">
                <p className={envDebug.environment.adminWalletConfigured ? 'text-green-400' : 'text-red-400'}>
                  Admin Wallet: {envDebug.environment.adminWalletConfigured ? '✅' : '❌'} {envDebug.environment.adminWalletAddress}
                </p>
                <p className={envDebug.environment.walletConnectConfigured ? 'text-green-400' : 'text-red-400'}>
                  WalletConnect: {envDebug.environment.walletConnectConfigured ? '✅' : '❌'} {envDebug.environment.walletConnectId}
                </p>
                <p className={envDebug.environment.jwtSecretConfigured ? 'text-green-400' : 'text-red-400'}>
                  JWT Secret: {envDebug.environment.jwtSecretConfigured ? '✅' : '❌'}
                </p>
                <p className="text-blue-400">
                  Chain ID: {chainId || 'Not connected'}
                </p>
                <p className={isConnected ? 'text-green-400' : 'text-red-400'}>
                  Wallet: {isConnected ? '✅ Connected' : '❌ Not connected'}
                </p>
              </div>
          {(!envDebug.environment.adminWalletConfigured || !envDebug.environment.walletConnectConfigured) && (
            <p className="text-yellow-400 mt-2 text-xs">
              ⚠️ Update your .env.local file with proper values
            </p>
          )}
        </div>
      )}

      {/* Signing errors are now handled through WalletContext and shown in the main error state above */}

      {!isConnected ? (
        <div className="text-center">
          <ConnectButton />
        </div>
      ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">Connected as:</p>
                <p className="text-sm font-mono text-white bg-gray-700 p-2 rounded break-all">
                  {address}
                </p>
                <Button 
                  onClick={() => handleDisconnect()}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Change Wallet
                </Button>
              </div>
              
              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Test signing buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={testSigning}
                  disabled={isSigningMessage}
                  variant="outline"
                  size="sm"
                >
                  🧪 Test Wagmi
                </Button>
                <Button 
                  onClick={testDirectSigning}
                  disabled={isSigningMessage}
                  variant="outline"
                  size="sm"
                >
                  🔗 Test Direct
                </Button>
              </div>
              
              <Button 
                onClick={handleLogin}
                disabled={isLoading || isSigningMessage || !loginMessage}
                className="w-full"
              >
                {isLoading || isSigningMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSigningMessage ? 'Sign Message...' : 'Logging in...'}
                  </>
                ) : (
                  'Sign Message to Login'
                )}
              </Button>
              
              {loginMessage && (
                <div className="text-xs text-gray-500 bg-gray-700 p-3 rounded">
                  <p className="font-semibold mb-1">Message to sign:</p>
                  <p className="break-all">{loginMessage}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
