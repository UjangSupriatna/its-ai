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

    // Use browser TTS as fallback
    // Server-side TTS APIs require paid services or have strict limits
    return NextResponse.json({
      success: true,
      useBrowserTTS: true,
      text: text,
      message: 'Using browser Text-to-Speech'
    });

  } catch (error: unknown) {
    console.error('TTS API Error:', error);
    return NextResponse.json({
      success: true,
      useBrowserTTS: true,
      message: 'Using browser TTS fallback'
    });
  }
}
