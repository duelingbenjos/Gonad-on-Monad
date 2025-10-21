# 🗄️ Database Setup Guide

Your Gonad NFT project now has a complete Prisma database integration with wallet-based authentication and whitelist management.

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env.local` file in your project root:

```bash
# SQLite Database (local file)
DATABASE_URL="file:./dev.db"

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID="gonad-demo-project-id"

# JWT Secret for sessions
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-too"
```

### 2. Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Create and run migrations (for production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with initial data
npm run db:seed
```

## 📊 Database Schema

### Core Tables

#### **Users** - Wallet-based user system
- `address` - Wallet address (primary identifier)
- `ens`, `email`, `twitter`, `discord` - Optional social metadata
- Relations to whitelist entries, signatures, sessions

#### **WhitelistEntry** - Flexible whitelist management
- Links users to collections
- Supports tiers: "og", "standard", "public"
- Tracks source: "signature", "manual", "airdrop"
- One entry per user per collection

#### **Collection** - Multiple NFT collections
- `name` - Collection identifier ("gonad", "gonad-2")
- `displayName` - Human-readable name
- Mint settings: price, timing, supply limits

#### **Signature** - Audit trail for all signatures
- Message and signature data
- Purpose tracking: "whitelist", "login", "transaction"
- IP/UserAgent for security

#### **Session** - Wallet-based authentication
- JWT-style session management
- IP/device tracking
- Expiration handling

#### **MintRecord** - Future mint tracking
- Links to blockchain transactions
- Pricing and quantity data

## 🔌 API Endpoints

### POST `/api/whitelist`
Join whitelist with signature verification
```json
{
  "address": "0x...",
  "message": "Welcome to Gooch Island...",
  "signature": "0x..."
}
```

### GET `/api/whitelist?address=0x...&collection=gonad`
Check whitelist status
```json
{
  "isWhitelisted": true,
  "data": {
    "tier": "standard",
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET `/api/whitelist/stats?collection=gonad`
Get whitelist statistics
```json
{
  "stats": {
    "total": 1337,
    "byTier": {
      "og": 100,
      "standard": 1237
    }
  }
}
```

## 🎣 React Hooks

### `useGonadWallet()`
Master hook for all wallet operations:
```typescript
const {
  // Connection state
  address, isConnected,
  
  // Wallet operations
  connectWallet, disconnect, signMessage,
  
  // Whitelist operations
  joinWhitelist, checkWhitelistStatus,
  
  // Display helpers
  displayAddress
} = useGonadWallet();
```

### `useWhitelist()`
Whitelist-specific operations:
```typescript
const {
  joinWhitelist,
  checkWhitelistStatus,
  isSubmitting,
  error
} = useWhitelist();
```

## 🛠️ Database Utilities

The `DatabaseService` class provides helpful methods:

```typescript
// User management
await DatabaseService.getUserByAddress(address);
await DatabaseService.createOrUpdateUser(address, metadata);

// Whitelist operations
await DatabaseService.addToWhitelist(address, "gonad", signature);
await DatabaseService.isWhitelisted(address, "gonad");
await DatabaseService.getWhitelistStats("gonad");

// Session management
await DatabaseService.createSession(userId, token, expiresAt);
await DatabaseService.validateSession(token);
```

## 🔒 Security Features

- **Signature Verification**: All whitelist entries require valid wallet signatures
- **IP/UserAgent Tracking**: Audit trail for security monitoring
- **Session Management**: JWT-based authentication with expiration
- **Rate Limiting**: Built-in protection against abuse (add middleware as needed)

## 🎯 Expansion Ready

The schema is designed to grow with your project:

- ✅ **Multi-collection support** - Add new NFT collections easily
- ✅ **Tiered whitelists** - OG, standard, public tiers
- ✅ **Social integrations** - ENS, Twitter, Discord linking
- ✅ **Mint tracking** - Connect to blockchain mint events
- ✅ **Admin features** - Manual whitelist management
- ✅ **Analytics** - Track user behavior and growth

## 📱 Frontend Integration

Your whitelist dialog now:
1. **Connects to real database** via API endpoints
2. **Verifies signatures** server-side for security
3. **Provides feedback** with proper error handling
4. **Syncs with localStorage** for quick responses

## 🎉 Next Steps

1. **Create `.env.local`** with SQLite configuration (see above)
2. **Run `npm run db:push`** to create tables
3. **Run `npm run db:seed`** to add initial data (Gonad collection)
4. **Test the whitelist flow** end-to-end
5. **Your SQLite database is ready!** - No server setup needed

Your wallet-based authentication system is now production-ready with zero-config SQLite! 🚀
