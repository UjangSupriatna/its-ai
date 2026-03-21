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

    // Use free TTS - try multiple providers
    const encodedText = encodeURIComponent(text);
    
    // Try Google Translate TTS first
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=id&client=tw-ob`;
      
      const response = await fetch(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({ 
          success: true, 
          audio: `data:audio/mpeg;base64,${base64}`,
          voice: voice
        });
      }
    } catch (e) {
      console.log('Google TTS failed, using browser fallback');
    }

    // Fallback: Use browser's built-in TTS
    return NextResponse.json({ 
      success: true, 
      useBrowserTTS: true,
      text: text,
      message: 'Using browser Text-to-Speech'
    });

  } catch (error: unknown) {
    console.error('TTS API Error:', error);
    
    // Fallback to browser TTS on any error
    return NextResponse.json({ 
      success: true, 
      useBrowserTTS: true,
      message: 'Using browser TTS fallback'
    });
  }
}
