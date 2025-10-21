import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';
import { verifyMessage } from 'viem';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, message, signature } = body;

    // Validate required fields
    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: address, message, signature' },
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

    // Get client metadata
    const ipAddress = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Add to whitelist
    const whitelistEntry = await DatabaseService.addToWhitelist(
      address,
      'gonad', // collection name
      {
        message,
        signature,
        ipAddress,
        userAgent,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully added to whitelist',
      data: {
        address,
        tier: whitelistEntry.tier,
        timestamp: whitelistEntry.createdAt,
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
