import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HF_TOKEN = process.env.HF_TOKEN;

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

    if (!HF_TOKEN) {
      return NextResponse.json({ 
        success: false,
        error: 'HF_TOKEN not configured' 
      }, { status: 500 });
    }

    // Enhance prompt for video
    const enhancedPrompt = `${prompt}, cinematic, high quality, smooth motion`;

    // Use Hugging Face text-to-video model
    const model = 'ali-vilab/text-to-video-ms-1.7b';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    console.log('Generating video with prompt:', enhancedPrompt);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          num_frames: Math.min(duration * 8, 24), // 8 frames per second, max 24
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF Video API Error:', response.status, errorText);
      
      // Check if model is loading
      if (response.status === 503 || errorText.includes('loading')) {
        return NextResponse.json({ 
          success: false,
          error: 'Model video sedang loading, coba lagi dalam 1-2 menit',
          retryIn: 60
        }, { status: 503 });
      }
      
      throw new Error(`HF API Error: ${response.status} - ${errorText}`);
    }

    // Response should be a video file (mp4)
    const videoBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(videoBuffer).toString('base64');
    const videoUrl = `data:video/mp4;base64,${base64}`;

    return NextResponse.json({ 
      success: true, 
      taskId: `video_${Date.now()}`,
      status: 'SUCCESS',
      videoUrl: videoUrl,
      prompt: prompt
    });

  } catch (error: unknown) {
    console.error('Video Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Gagal generate video. Coba lagi nanti.', 
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

    return NextResponse.json({ 
      success: true,
      status: 'SUCCESS',
      videoUrl: videoUrl || ''
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
