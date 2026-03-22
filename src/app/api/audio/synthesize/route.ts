import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice = 'tongtong', speed = 1.0 } = body;

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

    const zai = await getZAI();

    // Use z-ai TTS
    const response = await zai.audio.tts.create({
      input: text,
      voice: voice,
      speed: speed,
      response_format: 'wav',
      stream: false
    });

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    const base64 = buffer.toString('base64');

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
