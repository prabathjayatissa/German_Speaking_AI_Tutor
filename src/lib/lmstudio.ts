import type { Message, Correction } from "./supabase"

export interface LMStudioModel {
  id: string
  object: string
  owned_by: string
}

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface StreamChunk {
  type: "token" | "done" | "error"
  token?: string
  fullText?: string
  error?: string
}

export async function fetchAvailableModels(baseUrl: string): Promise<LMStudioModel[]> {
  try {
    // Use relative paths for localhost (go through dev proxy) or full URLs for remote servers
    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")
    const url = isLocalhost ? "/v1/models" : `${baseUrl}/v1/models`
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.data ?? []
  } catch {
    return []
  }
}

export async function* streamChat(
  baseUrl: string,
  model: string,
  messages: ChatMessage[],
  temperature = 0.7,
  maxTokens = 512
): AsyncGenerator<StreamChunk> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    // Use relative paths for localhost (go through dev proxy) or full URLs for remote servers
    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")
    const url = isLocalhost ? "/v1/chat/completions" : `${baseUrl}/v1/chat/completions`

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const errorText = await res.text().catch(() => "")
      yield { type: "error", error: `LM Studio error: HTTP ${res.status}${errorText ? ` - ${errorText}` : ""}` }
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      yield { type: "error", error: "No response body" }
      return
    }

    const decoder = new TextDecoder()
    let fullText = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n").filter(l => l.trim())

      for (const line of lines) {
        if (line === "data: [DONE]") {
          yield { type: "done", fullText }
          return
        }
        if (!line.startsWith("data: ")) continue
        try {
          const data = JSON.parse(line.slice(6))
          const token = data.choices?.[0]?.delta?.content
          if (token) {
            fullText += token
            yield { type: "token", token, fullText }
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    yield { type: "done", fullText }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Connection failed"
    console.error("[LM Studio] streamChat error:", errorMsg, err)
    yield {
      type: "error",
      error: errorMsg,
    }
  }
}

export async function extractCorrections(
  baseUrl: string,
  model: string,
  userMessage: string
): Promise<Correction[]> {
  const prompt: ChatMessage[] = [
    {
      role: "system",
      content: `You are a German grammar checker. Analyze the German text and return a JSON array of corrections.
Each correction: {"original": "wrong phrase", "corrected": "correct phrase", "explanation": "brief English explanation", "type": "grammar|vocabulary|word_order"}
Return [] if no errors. Return ONLY valid JSON, nothing else.`,
    },
    {
      role: "user",
      content: `Check this German text: "${userMessage}"`,
    },
  ]

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: prompt,
        temperature: 0.1,
        max_tokens: 256,
        stream: false,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? "[]"
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    return JSON.parse(match[0]) as Correction[]
  } catch {
    return []
  }
}

export function messagesToChatHistory(messages: Message[]): ChatMessage[] {
  return messages
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))
}
