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
    const { prompt, quality = 'speed', duration = 5 } = body;

    if (!prompt) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    console.log('Generating video with prompt:', prompt);

    const zai = await getZAI();

    // Create video generation task
    const task = await zai.video.generations.create({
      prompt: prompt,
      quality: quality as 'speed' | 'quality',
      duration: duration as 5 | 10,
      fps: 30
    });

    console.log('Video task created:', task.id, 'status:', task.task_status);

    // Poll for results with timeout
    let result = await zai.async.result.query(task.id);
    let pollCount = 0;
    const maxPolls = 120; // 10 minutes max (5s * 120)
    const pollInterval = 5000; // 5 seconds

    while (result.task_status === 'PROCESSING' && pollCount < maxPolls) {
      pollCount++;
      console.log(`Polling ${pollCount}/${maxPolls}: Status is ${result.task_status}`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      result = await zai.async.result.query(task.id);
    }

    if (result.task_status === 'SUCCESS') {
      // Get video URL from multiple possible fields
      const videoUrl = result.video_result?.[0]?.url ||
                      result.video_url ||
                      result.url ||
                      result.video;

      console.log('Video generated successfully:', videoUrl);

      return NextResponse.json({ 
        success: true, 
        taskId: task.id,
        status: 'SUCCESS',
        videoUrl: videoUrl,
        prompt: prompt
      });
    } else {
      console.log('Video generation failed or timeout:', result.task_status);
      return NextResponse.json({ 
        success: false,
        error: result.task_status === 'FAIL' ? 'Video generation failed' : 'Video generation timeout',
        taskId: task.id
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Video Generation API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false,
      error: 'Gagal generate video', 
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

    const zai = await getZAI();
    const result = await zai.async.result.query(taskId);

    const response: { success: boolean; status: string; videoUrl?: string } = {
      success: true,
      status: result.task_status
    };

    if (result.task_status === 'SUCCESS') {
      response.videoUrl = result.video_result?.[0]?.url ||
                          result.video_url ||
                          result.url ||
                          result.video;
    }

    return NextResponse.json(response);

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
