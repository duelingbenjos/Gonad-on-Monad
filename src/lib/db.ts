import { PrismaClient } from '@prisma/client';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

// Database utility functions for common operations
export class DatabaseService {
  static async getUserByAddress(address: string) {
    return prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        whitelistEntries: {
          include: {
            collection: true,
          },
        },
        signatures: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 signatures
        },
      },
    });
  }

  static async createOrUpdateUser(address: string, metadata?: {
    ens?: string;
    email?: string;
    twitter?: string;
    discord?: string;
  }) {
    return prisma.user.upsert({
      where: { address: address.toLowerCase() },
      update: {
        ...metadata,
        updatedAt: new Date(),
      },
      create: {
        address: address.toLowerCase(),
        ...metadata,
      },
    });
  }

  static async addToWhitelist(
    userAddress: string,
    collectionName: string,
    signature?: {
      message: string;
      signature: string;
      ipAddress?: string;
      userAgent?: string;
    },
    tier: string = 'standard'
  ) {
    // First, ensure user exists
    const user = await this.createOrUpdateUser(userAddress);
    
    // Get or create collection
    const collection = await prisma.collection.upsert({
      where: { name: collectionName },
      update: {},
      create: {
        name: collectionName,
        displayName: collectionName.charAt(0).toUpperCase() + collectionName.slice(1),
        isActive: true,
      },
    });

    // Create signature record if provided
    let signatureRecord = null;
    if (signature) {
      signatureRecord = await prisma.signature.create({
        data: {
          userId: user.id,
          message: signature.message,
          signature: signature.signature,
          purpose: 'whitelist',
          ipAddress: signature.ipAddress,
          userAgent: signature.userAgent,
        },
      });
    }

    // Add to whitelist
    return prisma.whitelistEntry.upsert({
      where: {
        userId_collectionId: {
          userId: user.id,
          collectionId: collection.id,
        },
      },
      update: {
        tier,
        signatureId: signatureRecord?.id,
        source: signature ? 'signature' : 'manual',
      },
      create: {
        userId: user.id,
        collectionId: collection.id,
        tier,
        signatureId: signatureRecord?.id,
        source: signature ? 'signature' : 'manual',
      },
    });
  }

  static async isWhitelisted(userAddress: string, collectionName: string) {
    const user = await prisma.user.findUnique({
      where: { address: userAddress.toLowerCase() },
    });

    if (!user) return false;

    const collection = await prisma.collection.findUnique({
      where: { name: collectionName },
    });

    if (!collection) return false;

    const entry = await prisma.whitelistEntry.findUnique({
      where: {
        userId_collectionId: {
          userId: user.id,
          collectionId: collection.id,
        },
      },
    });

    return !!entry;
  }

  static async getWhitelistStats(collectionName: string) {
    const collection = await prisma.collection.findUnique({
      where: { name: collectionName },
      include: {
        whitelistEntries: {
          select: {
            tier: true,
            createdAt: true,
          },
        },
      },
    });

    if (!collection) return null;

    const stats = {
      total: collection.whitelistEntries.length,
      byTier: {} as Record<string, number>,
      recentJoins: collection.whitelistEntries
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
    };

    collection.whitelistEntries.forEach((entry) => {
      stats.byTier[entry.tier] = (stats.byTier[entry.tier] || 0) + 1;
    });

    return stats;
  }

  static async createSession(userId: string, token: string, expiresAt: Date, metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
  }

  static async validateSession(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  static async invalidateSession(token: string) {
    return prisma.session.update({
      where: { token },
      data: { isActive: false },
    });
  }
}

export default prisma;
