import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HF_TOKEN = process.env.HF_TOKEN;

// Use multiple models for fallback
const IMAGE_MODELS = [
  'stabilityai/stable-diffusion-2-1',
  'runwayml/stable-diffusion-v1-5',
  'CompVis/stable-diffusion-v1-4',
];

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

    if (!HF_TOKEN) {
      return NextResponse.json({ 
        success: false,
        error: 'HF_TOKEN not configured' 
      }, { status: 500 });
    }

    // Enhance prompt for better results
    const enhancedPrompt = `${prompt}, high quality, detailed, professional`;

    // Try each model until one works
    let lastError = '';
    
    for (const model of IMAGE_MODELS) {
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
            inputs: enhancedPrompt,
            parameters: {
              negative_prompt: "blurry, bad quality, distorted, ugly",
            }
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log(`Model ${model} failed:`, errorText);
          lastError = errorText;
          continue; // Try next model
        }

        // Response is image blob, convert to base64
        const imageBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;

        console.log(`Successfully generated image with ${model}`);

        return NextResponse.json({ 
          success: true, 
          image: imageUrl,
          isUrl: false,
          prompt: prompt,
          model: model
        });

      } catch (err) {
        console.log(`Model ${model} error:`, err);
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
