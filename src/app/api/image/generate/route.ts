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
        error: 'HF_TOKEN not configured. Please add HF_TOKEN to Vercel Environment Variables.'
      }, { status: 500 });
    }

    // Try multiple models in order
    const models = [
      'stabilityai/stable-diffusion-xl-base-1.0',
      'stabilityai/stable-diffusion-2-1',
      'runwayml/stable-diffusion-v1-5',
    ];

    let lastError = '';

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        const url = `https://api-inference.huggingface.co/models/${model}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Model ${model} error:`, response.status, errorText);
          lastError = errorText;

          // Check if model is loading
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.includes('loading') || response.status === 503) {
              console.log(`Model ${model} is loading, trying next...`);
              continue;
            }
          } catch {}
          continue;
        }

        // Success!
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;

        console.log(`Image generated successfully with ${model}`);

        return NextResponse.json({
          success: true,
          image: imageUrl,
          prompt: prompt,
          model: model
        });

      } catch (err) {
        console.error(`Model ${model} failed:`, err);
        lastError = err instanceof Error ? err.message : 'Unknown error';
        continue;
      }
    }

    // All models failed
    return NextResponse.json({
      success: false,
      error: 'Semua model gagal. Coba lagi dalam beberapa menit.',
      details: lastError
    }, { status: 500 });

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
