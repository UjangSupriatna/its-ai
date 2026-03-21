import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, quality = 'speed', duration = 5 } = body;

    if (!prompt) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    // Use Pollinations Video API (free)
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Pollinations video generation (experimental, free)
    const videoUrl = `https://video.pollinations.ai/prompt/${encodedPrompt}?seed=${Date.now()}`;
    
    // For now, we'll return the video URL for the client to display
    // In production, you'd want to download and store it
    
    return NextResponse.json({ 
      success: true, 
      taskId: `video_${Date.now()}`,
      status: 'PROCESSING',
      message: 'Video generation started',
      videoUrl: videoUrl,
      prompt: prompt
    });

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
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const videoUrl = searchParams.get('videoUrl');

    if (!taskId) {
      return NextResponse.json({ 
        success: false,
        error: 'Task ID is required' 
      }, { status: 400 });
    }

    // For pollinations, the video is ready immediately after a short wait
    return NextResponse.json({ 
      success: true,
      status: 'SUCCESS',
      videoUrl: videoUrl || `https://video.pollinations.ai/prompt/test?seed=${taskId}`
    });

  } catch (error: unknown) {
    console.error('Video Status API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to check video status', 
      details: errorMessage 
    }, { status: 500 });
  }
}
