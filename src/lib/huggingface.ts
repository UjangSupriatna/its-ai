// Hugging Face Inference API Client
// Using HF token from environment variable

const HF_TOKEN = process.env.HF_TOKEN;

interface HFResponse {
  generated_text?: string;
  text?: string;
  error?: string;
}

// Text Generation (Chat)
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN not configured');
  }

  const model = 'mistralai/Mistral-7B-Instruct-v0.2';
  const url = `https://api-inference.huggingface.co/models/${model}`;
  
  const fullPrompt = systemPrompt 
    ? `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`
    : `<s>[INST] ${prompt} [/INST]`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HF API Error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return result[0]?.generated_text || 'No response generated';
}

// Image Generation
export async function generateImage(prompt: string): Promise<string> {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN not configured');
  }

  const model = 'stabilityai/stable-diffusion-xl-base-1.0';
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HF API Error: ${response.status} - ${error}`);
  }

  // Response is image blob, convert to base64
  const imageBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(imageBuffer).toString('base64');
  return `data:image/png;base64,${base64}`;
}

// Speech to Text (Whisper)
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN not configured');
  }

  const model = 'openai/whisper-large-v3';
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'audio/wav',
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HF API Error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return result.text || 'No transcription available';
}

// Image to Text (Vision)
export async function describeImage(imageBuffer: Buffer): Promise<string> {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN not configured');
  }

  const model = 'Salesforce/blip-image-captioning-large';
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'image/jpeg',
    },
    body: imageBuffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HF API Error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return result[0]?.generated_text || 'No description available';
}
