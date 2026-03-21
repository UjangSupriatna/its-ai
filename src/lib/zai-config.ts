// Z-AI SDK Configuration from environment variables
// These are the default values that will be used if env vars are not set

const DEFAULT_CONFIG = {
  baseUrl: 'http://172.25.136.210:8080/v1',
  apiKey: 'Z.ai',
  chatId: 'af741ff0-102b-424d-9979-010044b2f533',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2VjOTllYTUtZGEwOS00YzhkLTk1ZWEtNGI2YmQxZGYyOWNiIiwiY2hhdF9pZCI6ImFmNzQxZmYwLTEwMmItNDI0ZC05OTc5LTAxMDA0NGIyZjUzMyJ9.mc6BK86Cm9JxfJoLIPZGv853Aq6noVLGXEPpffsza-E',
  userId: '3ec99ea5-da09-4c8d-95ea-4b6bd1df29cb',
};

export function getZaiConfig() {
  return {
    baseUrl: process.env.ZAI_BASE_URL || DEFAULT_CONFIG.baseUrl,
    apiKey: process.env.ZAI_API_KEY || DEFAULT_CONFIG.apiKey,
    chatId: process.env.ZAI_CHAT_ID || DEFAULT_CONFIG.chatId,
    token: process.env.ZAI_TOKEN || DEFAULT_CONFIG.token,
    userId: process.env.ZAI_USER_ID || DEFAULT_CONFIG.userId,
  };
}

export const ZAI_CONFIG = getZaiConfig();
