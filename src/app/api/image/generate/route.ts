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

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'HF_TOKEN not configured'
      }, { status: 500 });
    }

    // Use FLUX model on Hugging Face
    const model = 'black-forest-labs/FLUX.1-schnell';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    const [width, height] = size.split('x').map(Number);
    const enhancedPrompt = `${prompt}, high quality, detailed`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          width: Math.min(width, 1024),
          height: Math.min(height, 1024),
          num_inference_steps: 4,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF Image API Error:', response.status, errorText);

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
    const imageUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: imageUrl,
      prompt: prompt
    });

  } catch (error: unknown) {
    console.error('Image Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: 'Gagal generate gambar',
      details: errorMessage
    }, { status: 500 });
  }
}
