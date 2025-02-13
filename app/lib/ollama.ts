// Basic Ollama client implementation
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-coder:6.7b';

// Helper function to check if Ollama is running
async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/version`);
    if (!response.ok) {
      throw new Error(`Ollama server returned ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Ollama server not accessible:', error);
    return false;
  }
}

export async function streamOllamaResponse(
  model: string,
  prompt: string,
  options?: {
    temperature?: number;
    system?: string;
  }
) {
  if (!await checkOllamaStatus()) {
    throw new Error('Ollama server is not accessible');
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: true,
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  return response;
}

export async function queryOllama(
  model: string,
  prompt: string,
  options?: {
    temperature?: number;
    system?: string;
  }
) {
  if (!await checkOllamaStatus()) {
    throw new Error('Ollama server is not accessible');
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  context?: string,
  options?: {
    temperature?: number;
    top_k?: number;
    top_p?: number;
    num_predict?: number;
  }
): Promise<string> {
  if (!await checkOllamaStatus()) {
    throw new Error('Ollama server is not accessible');
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\n${userPrompt}${context ? '\n\nContext:\n' + context : ''}`,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.1,
          top_k: options?.top_k ?? 10,
          top_p: options?.top_p ?? 0.9,
          num_predict: options?.num_predict ?? 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error('Invalid response from Ollama API');
    }

    return data.response;
  } catch (error) {
    console.error('Ollama completion error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate completion');
  }
} 