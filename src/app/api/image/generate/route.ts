import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/huggingface';

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

    // Enhance prompt for better results
    const enhancedPrompt = `${prompt}, high quality, detailed, 4k, professional`;

    // Use Hugging Face for image generation (requires HF_TOKEN)
    const imageUrl = await generateImage(enhancedPrompt);

    return NextResponse.json({ 
      success: true, 
      image: imageUrl,
      isUrl: false,
      prompt: prompt
    });

  } catch (error: unknown) {
    console.error('Image Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a model loading error
    if (errorMessage.includes('loading') || errorMessage.includes('Loading')) {
      return NextResponse.json({ 
        success: false,
        error: 'Model sedang loading, coba lagi dalam 30 detik', 
        details: errorMessage 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Gagal generate gambar. Pastikan HF_TOKEN sudah dikonfigurasi.', 
      details: errorMessage 
    }, { status: 500 });
  }
}
