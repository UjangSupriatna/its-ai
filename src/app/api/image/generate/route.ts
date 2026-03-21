import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: size as '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440',
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      image: `data:image/png;base64,${imageBase64}`,
      prompt: prompt
    });

  } catch (error: unknown) {
    console.error('Image Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to generate image', 
      details: errorMessage 
    }, { status: 500 });
  }
}
