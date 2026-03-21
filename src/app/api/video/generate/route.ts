import { NextRequest, NextResponse } from 'next/server';
import { getZaiConfig } from '@/lib/zai-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, quality = 'speed', duration = 5, fps = 30, imageUrl } = body;

    if (!prompt && !imageUrl) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt or imageUrl is required' 
      }, { status: 400 });
    }

    // Get config
    const config = getZaiConfig();

    // Dynamic import and directly instantiate with config
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = new ZAI(config);

    // Create video generation task
    const taskParams: Record<string, unknown> = {
      quality: quality,
      duration: duration,
      fps: fps,
    };

    if (prompt) {
      taskParams.prompt = prompt;
    }

    if (imageUrl) {
      taskParams.image_url = imageUrl;
    }

    const task = await zai.video.generations.create(taskParams);

    return NextResponse.json({ 
      success: true, 
      taskId: task.id,
      status: task.task_status,
      message: 'Video generation started. Use the task ID to check status.'
    });

  } catch (error: unknown) {
    console.error('Video Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to start video generation', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Check video generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ 
        success: false,
        error: 'Task ID is required' 
      }, { status: 400 });
    }

    // Get config
    const config = getZaiConfig();

    // Dynamic import and directly instantiate with config
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = new ZAI(config);

    const result = await zai.async.result.query(taskId);

    let videoUrl = null;
    if (result.task_status === 'SUCCESS') {
      videoUrl = result.video_result?.[0]?.url || 
                 (result as Record<string, unknown>).video_url ||
                 (result as Record<string, unknown>).url;
    }

    return NextResponse.json({ 
      success: true,
      status: result.task_status,
      videoUrl: videoUrl
    });

  } catch (error: unknown) {
    console.error('Video Status API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Failed to check video status', 
      details: errorMessage 
    }, { status: 500 });
  }
}
