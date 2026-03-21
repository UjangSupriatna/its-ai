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

    // Dynamic import
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const response = await zai.audio.tts.create({
      text: text,
      voice: voice,
    });

    const audioBase64 = response.data?.base64;

    if (!audioBase64) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to synthesize speech' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      audio: `data:audio/wav;base64,${audioBase64}`,
      voice: voice
    });

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
