import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Check if message contains expected authentication content
    if (!message.includes('Sign in to Gooch Island')) {
      return NextResponse.json(
        { error: 'Invalid message content' },
        { status: 400 }
      );
    }

    // Extract timestamp from message to prevent replay attacks
    const timestampMatch = message.match(/Timestamp: (.+)/);
    if (timestampMatch) {
      const messageTimestamp = new Date(timestampMatch[1]).getTime();
      const currentTime = Date.now();
      const timeDiff = Math.abs(currentTime - messageTimestamp);
      
      // Message must be signed within last 5 minutes
      if (timeDiff > 5 * 60 * 1000) {
        return NextResponse.json(
          { error: 'Message timestamp too old' },
          { status: 400 }
        );
      }
    }

    // Create user object
    const user = {
      address: address.toLowerCase(),
    };

    // Generate JWT token
    const jwt = sign(
      {
        address: user.address,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      JWT_SECRET
    );

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      jwt,
      user,
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Endpoint to verify JWT tokens
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // In a real app, you'd verify the JWT here
    // For now, we'll just return a simple response
    return NextResponse.json({
      message: 'Token verification endpoint - implement JWT verification logic here',
      token: token.substring(0, 20) + '...' // Don't expose full token in response
    });

  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
