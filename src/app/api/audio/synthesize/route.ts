import { NextRequest, NextResponse } from 'next/server';
import { getZaiConfig } from '@/lib/zai-config';

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

    // Get config
    const config = getZaiConfig();

    // Dynamic import and directly instantiate with config
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = new ZAI(config);

    // TTS uses 'input' not 'text'
    const response = await zai.audio.tts.create({
      input: text,
      voice: voice,
    });

    // Response is a Response object, need to convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return NextResponse.json({ 
      success: true, 
      audio: `data:audio/wav;base64,${base64}`,
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
