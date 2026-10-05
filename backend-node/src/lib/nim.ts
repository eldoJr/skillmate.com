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

const NIM_MODEL       = process.env.NIM_LLM_MODEL      ?? 'nvidia/nemotron-3.5-lightning-30b-a3b'
const NIM_TEMPERATURE = Number(process.env.NIM_TEMPERATURE  ?? 1)
const NIM_TOP_P       = Number(process.env.NIM_TOP_P        ?? 0.95)
const NIM_MAX_TOKENS  = Number(process.env.NIM_MAX_TOKENS   ?? 16384)
const NIM_THINKING    = process.env.NIM_ENABLE_THINKING === 'true'
const NIM_REASONING   = Number(process.env.NIM_REASONING_BUDGET ?? 16384)

export async function chatCompletion(
  messages: { role: string; content: string }[],
  { temperature = NIM_TEMPERATURE, maxTokens = NIM_MAX_TOKENS, model = NIM_MODEL }: { temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<string> {
  return withRetry(async () => {
    const client = getClient()
    const res = await (client.chat.completions.create as Function)({
      model,
      messages:   messages as OpenAI.ChatCompletionMessageParam[],
      temperature,
      top_p:      NIM_TOP_P,
      max_tokens: maxTokens,
      ...(NIM_THINKING && { extra_body: { chat_template_kwargs: { enable_thinking: true }, reasoning_budget: NIM_REASONING } }),
    })
    return res.choices[0].message.content ?? ''
  })
}

export async function* streamChatCompletion(
  messages: { role: string; content: string }[],
  { temperature = NIM_TEMPERATURE, maxTokens = NIM_MAX_TOKENS }: { temperature?: number; maxTokens?: number } = {}
): AsyncGenerator<string> {
  const client = getClient()
  const stream = await (client.chat.completions.create as Function)({
    model:      NIM_MODEL,
    messages:   messages as OpenAI.ChatCompletionMessageParam[],
    temperature,
    top_p:      NIM_TOP_P,
    max_tokens: maxTokens,
    stream:     true,
    ...(NIM_THINKING && { extra_body: { chat_template_kwargs: { enable_thinking: true }, reasoning_budget: NIM_REASONING } }),
  })
  for await (const chunk of stream) {
    if (!chunk.choices?.length) continue
    const delta = chunk.choices[0]?.delta
    const reasoning = (delta as any)?.reasoning_content
    if (reasoning) yield reasoning
    if (delta?.content) yield delta.content
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
