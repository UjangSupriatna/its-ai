import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = '1024x1024' } = body;

    if (!prompt) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    // Image generation not available on Vercel with free HF token
    // Requires dedicated image generation API
    return NextResponse.json({ 
      success: false,
      error: 'Image generation memerlukan API khusus. Fitur ini tersedia saat deploy ke jagoan hosting.',
      prompt: prompt
    }, { status: 503 });

  } catch (error: unknown) {
    console.error('Image Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate image', 
      details: errorMessage 
    }, { status: 500 });
  }
}
