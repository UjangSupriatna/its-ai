import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'tongtong' } = body;

    if (!text) {
      return NextResponse.json({ 
        success: false,
        error: 'Text is required' 
      }, { status: 400 });
    }

    if (text.length > 1024) {
      return NextResponse.json({ 
        success: false,
        error: 'Text must be less than 1024 characters' 
      }, { status: 400 });
    }

    // Use a free TTS API - VoiceRSS or similar
    // For now, we'll use a simple approach with Web Speech API on client
    // Or return an error message that TTS is not available
    
    return NextResponse.json({ 
      success: false,
      error: 'TTS feature requires internal API server. Please deploy to jagoan hosting for full features.',
      text: text
    }, { status: 503 });

  } catch (error: unknown) {
    console.error('TTS API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to synthesize speech', 
      details: errorMessage 
    }, { status: 500 });
  }
}
