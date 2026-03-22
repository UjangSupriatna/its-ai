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
        error: 'HF_TOKEN not configured'
      }, { status: 500 });
    }

    // Generate cinematic image for video
    const videoPrompt = `${prompt}, cinematic, dramatic lighting, professional photography, 16:9`;

    const model = 'stabilityai/stable-diffusion-xl-base-1.0';
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;

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

      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status}`,
        details: errorText
      }, { status: 500 });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const videoFrameUrl = `data:image/jpeg;base64,${base64}`;

    console.log('Video frame generated successfully, size:', imageBuffer.byteLength);

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
  return NextResponse.json({
    success: true,
    status: 'SUCCESS'
  });
}
