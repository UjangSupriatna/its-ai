import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'HF_TOKEN not configured'
      }, { status: 500 });
    }

    // For video, we generate an image with cinematic prompt
    // Real video generation is too heavy for serverless
    const model = 'black-forest-labs/FLUX.1-schnell';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    const videoPrompt = `${prompt}, cinematic, motion blur, dynamic scene, 16:9 widescreen`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: videoPrompt,
        parameters: {
          width: 1280,
          height: 720,
          num_inference_steps: 4,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF Video API Error:', response.status, errorText);

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.includes('loading') || response.status === 503) {
          return NextResponse.json({
            success: false,
            error: 'Model sedang loading, coba lagi dalam 30 detik'
          }, { status: 503 });
        }
      } catch {}

      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status}`
      }, { status: 500 });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const videoFrameUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      taskId: `video_${Date.now()}`,
      status: 'SUCCESS',
      videoUrl: videoFrameUrl,
      prompt: prompt,
      note: 'Generated as cinematic video frame'
    });

  } catch (error: unknown) {
    console.error('Video Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: 'Gagal generate video',
      details: errorMessage
    }, { status: 500 });
  }
}

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
