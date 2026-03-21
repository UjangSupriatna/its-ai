import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, quality = 'speed', duration = 5, fps = 30, imageUrl } = body;

    if (!prompt && !imageUrl) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt or imageUrl is required' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false,
      error: 'Video generation requires internal API server. Please deploy to jagoan hosting for full features.'
    }, { status: 503 });

  } catch (error: unknown) {
    console.error('Video Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to start video generation', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Check video generation status
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: false,
    error: 'Video generation requires internal API server. Please deploy to jagoan hosting for full features.'
  }, { status: 503 });
}
