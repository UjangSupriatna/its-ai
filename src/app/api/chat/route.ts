import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    // Build messages array with history
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `Kamu adalah asisten AI yang helpful dan friendly. 
Jawab dalam Bahasa Indonesia jika user menggunakan Bahasa Indonesia.
Kamu bisa membantu dengan berbagai tugas seperti:
- Menjawab pertanyaan
- Menulis konten ( artikel, email, caption, dll)
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

    const completion = await zai.chat.completions.create({
      messages: messages,
    });

    const response = completion.choices[0]?.message?.content || 'Maaf, saya tidak bisa menjawab saat ini.';

    return NextResponse.json({ 
      success: true, 
      response: response 
    });

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to process chat', 
      details: errorMessage 
    }, { status: 500 });
  }
}
