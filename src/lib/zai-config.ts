import fs from 'fs';
import path from 'path';

// Z-AI SDK Configuration
export const ZAI_CONFIG = {
  baseUrl: process.env.ZAI_BASE_URL || 'http://172.25.136.210:8080/v1',
  apiKey: process.env.ZAI_API_KEY || 'Z.ai',
  chatId: process.env.ZAI_CHAT_ID || 'af741ff0-102b-424d-9979-010044b2f533',
  token: process.env.ZAI_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2VjOTllYTUtZGEwOS00YzhkLTk1ZWEtNGI2YmQxZGYyOWNiIiwiY2hhdF9pZCI6ImFmNzQxZmYwLTEwMmItNDI0ZC05OTc5LTAxMDA0NGIyZjUzMyJ9.mc6BK86Cm9JxfJoLIPZGv853Aq6noVLGXEPpffsza-E',
  userId: process.env.ZAI_USER_ID || '3ec99ea5-da09-4c8d-95ea-4b6bd1df29cb',
};

// Ensure config file exists (for SDK to read)
export function ensureZaiConfig() {
  const configPath = path.join(process.cwd(), '.z-ai-config');
  const configContent = JSON.stringify(ZAI_CONFIG, null, 2);
  
  try {
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, configContent, 'utf-8');
      console.log('Z-AI config file created');
    }
  } catch (error) {
    console.error('Failed to create Z-AI config file:', error);
  }
}
