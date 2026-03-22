import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    const zai = await getZAI();

    // Build conversation context
    let conversationContext = '';
    if (history && Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'user') {
          conversationContext += `User: ${msg.content}\n`;
        } else {
          conversationContext += `Assistant: ${msg.content}\n`;
        }
      }
    }

    const systemPrompt = `Kamu adalah asisten AI yang helpful dan friendly.
Jawab dalam Bahasa Indonesia jika user menggunakan Bahasa Indonesia.
Kamu bisa membantu dengan berbagai tugas seperti:
- Menjawab pertanyaan
- Menulis konten (artikel, email, caption, dll)
- Membantu coding
- Memberikan saran dan ide
- Menerjemahkan teks

Jawab dengan jelas, informatif, dan ramah.`;

    const fullPrompt = conversationContext
      ? `${systemPrompt}\n\n${conversationContext}User: ${message}\nAssistant:`
      : `${systemPrompt}\n\nUser: ${message}\nAssistant:`;

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []).map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
    });

    const assistantMessage = response.choices?.[0]?.message?.content || 'Maaf, tidak ada response.';

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
