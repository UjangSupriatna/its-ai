import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ 
        success: false,
        error: 'Message is required' 
      }, { status: 400 });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    
    if (!HF_TOKEN) {
      return NextResponse.json({ 
        success: false,
        error: 'HF_TOKEN not configured' 
      }, { status: 500 });
    }

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: `Kamu adalah asisten AI yang helpful dan friendly. 
Jawab dalam Bahasa Indonesia jika user menggunakan Bahasa Indonesia.
Kamu bisa membantu dengan berbagai tugas seperti:
- Menjawab pertanyaan
- Menulis konten (artikel, email, caption, dll)
- Membantu coding
- Memberikan saran dan ide
- Menerjemahkan teks

Jawab dengan jelas, informatif, dan ramah.`
      }
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Use Hugging Face Router API with Llama 3.1 8B (OpenAI-compatible format)
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HF API Error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    const assistantMessage = result.choices?.[0]?.message?.content || 'Maaf, tidak ada response.';

    return NextResponse.json({ 
      success: true, 
      response: assistantMessage 
    });

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process chat', 
      details: errorMessage 
    }, { status: 500 });
  }
}
