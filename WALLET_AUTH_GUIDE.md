# Wallet Authentication System

This guide explains how to use the reusable wallet authentication system in your components.

## Overview

The authentication system provides a drop-in component that handles the complete wallet sign-in flow:

1. **Connect** - User connects their wallet (MetaMask, Phantom, etc.)
2. **Sign** - User signs a message to prove wallet ownership  
3. **Authenticate** - Backend validates signature and returns JWT token
4. **Success** - JWT stored globally, user is now authenticated

## Quick Start

### 1. Basic Usage

```tsx
import { WalletSignIn } from '@/components/WalletSignIn';

export function MyComponent() {
  return (
    <div>
      <WalletSignIn />
    </div>
  );
}
```

### 2. Check Authentication Status

```tsx
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { isAuthenticated, user, jwt, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.address}!</p>
        <button onClick={logout}>Sign Out</button>
      </div>
    );
  }

  return <WalletSignIn />;
}
```

### 3. Using JWT in API Calls

```tsx
import { useAuth } from '@/contexts/AuthContext';

export function useProtectedAPI() {
  const { jwt } = useAuth();

  const callAPI = async (endpoint: string, data: any) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  };

  return { callAPI };
}
```

## Component Props

### WalletSignIn Props

```tsx
interface WalletSignInProps {
  // Trigger button customization
  triggerVariant?: 'hero' | 'outline' | 'default';
  triggerText?: string;
  triggerSize?: 'sm' | 'default' | 'lg' | 'xl';
  
  // Behavior
  autoClose?: boolean; // Close dialog on successful auth (default: true)
  
  // Optional callbacks
  onAuthSuccess?: (user: any, jwt: string) => void;
  onAuthFailure?: (error: string) => void;
}
```

### Examples

```tsx
// Hero button style
<WalletSignIn 
  triggerVariant="hero" 
  triggerText="Sign In Now" 
  triggerSize="lg"
/>

// With custom callbacks
<WalletSignIn 
  onAuthSuccess={(user, jwt) => {
    console.log('User authenticated:', user);
    // Trigger additional logic
  }}
  onAuthFailure={(error) => {
    console.error('Auth failed:', error);
    // Handle failure
  }}
  autoClose={false} // Keep dialog open to show success state
/>
```

## Authentication Context

### useAuth Hook

```tsx
const {
  isAuthenticated,  // boolean - is user signed in?
  user,            // User object with address
  jwt,             // JWT token string
  setAuthData,     // Function to manually set auth data
  logout,          // Function to sign out
  isTokenExpired   // Function to check token expiry
} = useAuth();
```

### User Object

```tsx
interface User {
  address: string; // Wallet address (lowercase)
}
```

## API Integration

### Protected API Routes

Create protected API routes that verify JWT tokens:

```tsx
// pages/api/protected-route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    // Token is valid, proceed with protected logic
    
    return NextResponse.json({ 
      message: 'Success',
      user: decoded 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

### Environment Variables

Add to your `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-here
```

## Architecture

### Context Hierarchy

```
WagmiProvider
  ├── RainbowKitProvider  
  │   ├── WalletProvider    (wallet operations)
  │   │   ├── AuthProvider  (authentication state)
  │   │   │   └── Your App Components
```

### File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx     # Global auth state
│   └── WalletContext.tsx   # Wallet operations
├── hooks/
│   └── useAuth.ts          # Auth operations hook
├── components/
│   ├── WalletSignIn.tsx    # Main sign-in component
│   └── AuthExample.tsx     # Usage examples
└── app/api/
    └── auth/
        └── route.ts        # Auth endpoint
```

## Security Features

- **Message signing** - Proves wallet ownership without gas fees
- **Timestamp validation** - Prevents replay attacks (5 minute window)
- **JWT expiration** - Tokens expire after 24 hours
- **Auto-logout** - Expired tokens are automatically cleared
- **Signature verification** - Backend validates all signatures

## Best Practices

1. **Always check `isAuthenticated`** before showing protected content
2. **Use callbacks sparingly** - Global auth state is usually sufficient  
3. **Handle auth failures gracefully** - Show appropriate error messages
4. **Protect sensitive API routes** - Always verify JWT tokens server-side
5. **Keep JWT secret secure** - Use environment variables, never commit to git

## Troubleshooting

### Common Issues

1. **"useAuth must be used within AuthProvider"**
   - Ensure AuthProvider is properly set up in your app providers

2. **JWT token invalid**
   - Check JWT_SECRET environment variable
   - Verify token hasn't expired

3. **Wallet not connecting**
   - Ensure WalletConnect project ID is set
   - Check browser wallet extensions

4. **Signature verification fails**
   - Ensure message format matches exactly
   - Check for proper signature encoding

### Debug Mode

Enable debug logging:

```tsx
// Add to your component for debugging
useEffect(() => {
  console.log('Auth State:', { isAuthenticated, user, jwt });
}, [isAuthenticated, user, jwt]);
```
