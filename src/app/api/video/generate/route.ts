import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

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
        error: 'HF_TOKEN not configured. Please add HF_TOKEN to Vercel Environment Variables.'
      }, { status: 500 });
    }

    // For video, we generate a cinematic image
    const videoPrompt = `${prompt}, cinematic, dramatic lighting, professional photography`;

    // Try Stable Diffusion for video frame
    const model = 'stabilityai/stable-diffusion-xl-base-1.0';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    console.log('Generating video frame with prompt:', videoPrompt);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: videoPrompt,
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
            error: 'Model sedang loading, coba lagi dalam 1-2 menit'
          }, { status: 503 });
        }
      } catch {}

      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status}`,
        details: errorText
      }, { status: 500 });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const videoFrameUrl = `data:image/png;base64,${base64}`;

    console.log('Video frame generated successfully');

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
