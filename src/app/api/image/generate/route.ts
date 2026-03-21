import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HF_TOKEN = process.env.HF_TOKEN;

// Use Flux model which is more reliable on HF
const IMAGE_MODEL = 'black-forest-labs/FLUX.1-schnell';

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

    // Parse size
    const [width, height] = size.split('x').map(Number);

    // Enhance prompt for better results
    const enhancedPrompt = `${prompt}, high quality, detailed`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // Use Hugging Face Inference API
    const url = `https://api-inference.huggingface.co/models/${IMAGE_MODEL}`;
    
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
          num_inference_steps: 4, // FLUX schnell is fast
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF Image API Error:', response.status, errorText);
      
      // Try to parse error
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.includes('loading') || response.status === 503) {
          const waitTime = errorJson.estimated_time || 20;
          return NextResponse.json({ 
            success: false,
            error: `Model sedang loading, coba lagi dalam ${Math.ceil(waitTime)} detik`,
            retryIn: Math.ceil(waitTime)
          }, { status: 503 });
        }
      } catch {}
      
      return NextResponse.json({ 
        success: false,
        error: `API Error: ${response.status}`,
        details: errorText
      }, { status: 500 });
    }

    // Response is image binary
    const imageBuffer = await response.arrayBuffer();
    
    if (imageBuffer.byteLength < 1000) {
      return NextResponse.json({ 
        success: false,
        error: 'Response terlalu kecil, mungkin error'
      }, { status: 500 });
    }

    const base64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64}`;

    console.log('Image generated successfully, size:', imageBuffer.byteLength);

    return NextResponse.json({ 
      success: true, 
      image: imageUrl,
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
