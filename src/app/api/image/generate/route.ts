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

    // Use multiple free image generation APIs
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Option 1: Pollinations AI (Free, no API key needed)
    // Format: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}&nologo=true
    const [width, height] = size.split('x').map(Number);
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;

    // Return the URL directly - client will fetch it
    return NextResponse.json({ 
      success: true, 
      image: imageUrl,
      isUrl: true,
      prompt: prompt
    });

  } catch (error: unknown) {
    console.error('Image Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate image', 
      details: errorMessage 
    }, { status: 500 });
  }
}
