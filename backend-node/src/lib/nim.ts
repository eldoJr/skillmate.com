import 'dotenv/config'
import OpenAI from 'openai'

function getClient(): OpenAI {
  if (!process.env.NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY is not configured. AI features are unavailable.')
  return new OpenAI({
    apiKey:  process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1',
  })
}

export function requireAI() {
  if (!process.env.NVIDIA_API_KEY) throw new Error('AI_UNAVAILABLE')
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown
  for (let i = 0; i < attempts; i++) {
    try { return await fn() } catch (e) {
      lastErr = e
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 2000 * (i + 1)))
    }
  }
  throw lastErr
}

export async function chatCompletion(
  messages: { role: string; content: string }[],
  { temperature = 0.7, maxTokens = 1024, model }: { temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<string> {
  return withRetry(async () => {
    const client = getClient()
    const res = await client.chat.completions.create({
      model:       model ?? process.env.NIM_LLM_MODEL ?? 'deepseek-ai/deepseek-v4-pro-0813',
      messages:    messages as OpenAI.ChatCompletionMessageParam[],
      temperature,
      max_tokens:  maxTokens,
    })
    return res.choices[0].message.content ?? ''
  })
}

export async function* streamChatCompletion(
  messages: { role: string; content: string }[],
  { temperature = 0.7, maxTokens = 1024 }: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const client = getClient()
  const stream = await client.chat.completions.create({
    model:       process.env.NIM_LLM_MODEL ?? 'deepseek-ai/deepseek-v4-pro-0813',
    messages:    messages as OpenAI.ChatCompletionMessageParam[],
    temperature,
    max_tokens:  maxTokens,
    stream:      true,
  })
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}

export async function embedText(text: string): Promise<number[]> {
  return withRetry(async () => {
    const client = getClient()
    const res = await client.embeddings.create({
      model:           process.env.NIM_EMBEDDING_MODEL ?? 'nvidia/llama-3.2-nv-embedqa-1b-v1',
      input:           text,
      encoding_format: 'float',
    })
    return res.data[0].embedding
  })
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  return withRetry(async () => {
    const client = getClient()
    const res = await client.embeddings.create({
      model:           process.env.NIM_EMBEDDING_MODEL ?? 'nvidia/llama-3.2-nv-embedqa-1b-v1',
      input:           texts,
      encoding_format: 'float',
    })
    return res.data.sort((a, b) => a.index - b.index).map(d => d.embedding)
  })
}

export function parseJSON<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.trim().replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return fallback
  }
}
