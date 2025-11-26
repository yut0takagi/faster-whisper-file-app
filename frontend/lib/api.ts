// API設定
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  transcribe: `${API_BASE_URL}/api/transcribe`,
  generateMinutes: `${API_BASE_URL}/api/generate-minutes`,
  testConnection: (apiUrl: string, modelName: string) =>
    `${API_BASE_URL}/api/test-connection?api_url=${encodeURIComponent(apiUrl)}&model_name=${encodeURIComponent(modelName)}`,
  getModels: (apiUrl: string) =>
    `${API_BASE_URL}/api/models?api_url=${encodeURIComponent(apiUrl)}`,
};

