import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HF_TOKEN = process.env.HF_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, duration = 5 } = body;

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

    // Try text-to-video model
    const model = 'ali-vilab/text-to-video-ms-1.7b';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    console.log('Generating video with prompt:', prompt);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_frames: Math.min(duration * 8, 16), // Keep it small for reliability
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF Video API Error:', response.status, errorText);
      
      // Parse error for better message
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.includes('loading')) {
          return NextResponse.json({ 
            success: false,
            error: 'Model video sedang loading. Ini model besar, coba lagi dalam 2-3 menit.',
            estimated_time: errorJson.estimated_time || 120
          }, { status: 503 });
        }
      } catch {}
      
      if (response.status === 503) {
        return NextResponse.json({ 
          success: false,
          error: 'Model video sedang loading, coba lagi dalam 2-3 menit'
        }, { status: 503 });
      }
      
      throw new Error(`HF API Error: ${response.status} - ${errorText}`);
    }

    // Check content type
    const contentType = response.headers.get('content-type') || '';
    console.log('Response content-type:', contentType);

    // Response should be a video file
    const videoBuffer = await response.arrayBuffer();
    
    if (videoBuffer.byteLength < 1000) {
      // Too small, probably an error
      const text = new TextDecoder().decode(videoBuffer);
      console.error('Small response:', text);
      throw new Error('Invalid video response');
    }

    const base64 = Buffer.from(videoBuffer).toString('base64');
    const videoUrl = `data:video/mp4;base64,${base64}`;

    console.log('Video generated successfully, size:', videoBuffer.byteLength);

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
      error: 'Gagal generate video. Model video membutuhkan waktu loading yang lama.', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Check video generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ 
        success: false,
        error: 'Task ID is required' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      status: 'SUCCESS'
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
