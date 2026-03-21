import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Validate text length
    if (text.length > 1024) {
      return NextResponse.json({ 
        error: 'Text is too long. Maximum 1024 characters allowed.' 
      }, { status: 400 });
    }

    const zai = await ZAI.create();

    // Use TTS API correctly - zai.audio.tts.create
    const response = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice,
      speed: speed,
      response_format: 'wav',
      stream: false,
    });

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    const base64 = buffer.toString('base64');

    return NextResponse.json({ 
      success: true, 
      audio: `data:audio/wav;base64,${base64}`,
      format: 'wav'
    });

  } catch (error: unknown) {
    console.error('TTS API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to synthesize speech', 
      details: errorMessage 
    }, { status: 500 });
  }
}
