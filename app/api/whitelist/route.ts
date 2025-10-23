import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';
import { verifyMessage } from 'viem';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, message, signature } = body;
    
    let verifiedAddress: string;
    let authMethod: string;

    // Check for JWT authentication first
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = verify(token, JWT_SECRET) as any;
        verifiedAddress = decoded.address;
        authMethod = 'jwt';
        
        // Ensure the address in the body matches the JWT
        if (address && address.toLowerCase() !== verifiedAddress.toLowerCase()) {
          return NextResponse.json(
            { error: 'Address mismatch between request and JWT token' },
            { status: 400 }
          );
        }
      } catch (jwtError) {
        return NextResponse.json(
          { error: 'Invalid or expired JWT token' },
          { status: 401 }
        );
      }
    } else {
      // Fall back to signature-based authentication (legacy)
      if (!address || !message || !signature) {
        return NextResponse.json(
          { error: 'Missing required fields: address, message, signature or Authorization header' },
          { status: 400 }
        );
      }

      // Verify the signature
      const isValidSignature = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }

      // Check if message contains expected whitelist content
      if (!message.includes('Gonad on Monad whitelist confirmation')) {
        return NextResponse.json(
          { error: 'Invalid message content' },
          { status: 400 }
        );
      }
      
      verifiedAddress = address;
      authMethod = 'signature';
    }

    // Get client metadata
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Add to whitelist
    const whitelistEntry = await DatabaseService.addToWhitelist(
      verifiedAddress,
      'gonad', // collection name
      {
        message: message || `JWT Authentication - ${authMethod}`,
        signature: signature || `JWT:${authMethod}`,
        ipAddress,
        userAgent,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully added to whitelist',
      data: {
        address: verifiedAddress,
        tier: whitelistEntry.tier,
        timestamp: whitelistEntry.createdAt,
        authMethod,
      },
    });

  } catch (error) {
    console.error('Whitelist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const collection = searchParams.get('collection') || 'gonad';

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter required' },
        { status: 400 }
      );
    }

    // Check whitelist status
    const isWhitelisted = await DatabaseService.isWhitelisted(address, collection);
    
    // Get user data if whitelisted
    let userData = null;
    if (isWhitelisted) {
      userData = await DatabaseService.getUserByAddress(address);
    }

    return NextResponse.json({
      address,
      collection,
      isWhitelisted,
      data: userData ? {
        tier: userData.whitelistEntries.find(entry => 
          entry.collection.name === collection
        )?.tier,
        joinedAt: userData.whitelistEntries.find(entry => 
          entry.collection.name === collection
        )?.createdAt,
      } : null,
    });

  } catch (error) {
    console.error('Whitelist check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
