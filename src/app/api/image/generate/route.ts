import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize ZAI instance (will be reused)
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

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

    console.log('Generating image with prompt:', prompt, 'size:', size);

    const zai = await getZAI();

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: size as '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440'
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      throw new Error('No image data in response');
    }

    console.log('Image generated successfully');

    return NextResponse.json({ 
      success: true, 
      image: `data:image/png;base64,${imageBase64}`,
      isUrl: false,
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
