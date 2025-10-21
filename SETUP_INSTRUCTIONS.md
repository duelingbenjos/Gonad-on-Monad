# 🚀 Quick Setup Instructions

## 1. Create Environment File

Create a `.env.local` file in your project root with this content:

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

## 2. Set Up Database

Run these commands in order:

```bash
# Create the database tables
npm run db:push

# Add initial data (Gonad collection)
npm run db:seed

# Start the development server
npm run dev
```

## 3. Test the Whitelist

1. Go to http://localhost:3000
2. Click "Get Whitelist"
3. Connect your wallet
4. Sign the message
5. Check the database: `npm run db:studio`

## 🎉 You're Done!

Your SQLite database is now running locally with zero configuration needed. The `dev.db` file will be created automatically in your project root.

## Optional: View Your Database

Run `npm run db:studio` to open Prisma Studio and see your data in a web interface at http://localhost:5555
