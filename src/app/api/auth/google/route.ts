import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Google OAuth credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Get the redirect URI from the request headers
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const redirectUri = `${protocol}://${host}/auth/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return NextResponse.json(
        { success: false, error: errorData.error_description || 'Failed to exchange token' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, id_token } = tokenData;

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to get user info' },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();

    // Return user data and tokens
    return NextResponse.json({
      success: true,
      user: {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        email_verified: userData.email_verified,
      },
      access_token,
      id_token,
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
