import type { ChatSettings, Message, ModelName, PendingAttachment } from '../types/chat'

type OAuthResponse = {
  access_token: string
  expires_at: number
}

type CompletionResponse = {
  choices?: Array<{
    message?: {
      role?: string
      content?: string
    }
    delta?: {
      content?: string
    }
  }>
}

type ModelsResponse = {
  data?: Array<{
    id?: string
  }>
}

type UploadResponse = {
  id?: string
}

type ApiError = {
  message?: string
}

const scope = import.meta.env.VITE_GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS'
const oauthUrl = import.meta.env.VITE_GIGACHAT_OAUTH_URL ?? '/api/gigachat/oauth'
const chatUrl = import.meta.env.VITE_GIGACHAT_CHAT_URL ?? '/api/gigachat/chat/completions'
const modelsUrl = import.meta.env.VITE_GIGACHAT_MODELS_URL ?? '/api/gigachat/models'
const filesUrl = import.meta.env.VITE_GIGACHAT_FILES_URL ?? '/api/gigachat/files'

let tokenCache: { value: string; expiresAt: number } | null = null

function getErrorMessage(fallback: string, data?: ApiError) {
  return data?.message?.trim() || fallback
}

async function getAccessToken(signal?: AbortSignal) {
  const nowInSeconds = Math.floor(Date.now() / 1000)

  if (tokenCache && tokenCache.expiresAt - 60 > nowInSeconds) {
    return tokenCache.value
  }

  const authKey = import.meta.env.VITE_GIGACHAT_AUTH_KEY

  if (!authKey) {
    throw new Error('Не настроен VITE_GIGACHAT_AUTH_KEY в .env.')
  }

  const response = await fetch(oauthUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      RqUID: crypto.randomUUID(),
      Authorization: `Basic ${authKey}`,
    },
    body: new URLSearchParams({ scope }),
    signal,
  })

  if (!response.ok) {
    let errorData: ApiError | undefined

    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = undefined
    }

    throw new Error(getErrorMessage('Не удалось получить access token GigaChat.', errorData))
  }

  const data = (await response.json()) as OAuthResponse
  tokenCache = {
    value: data.access_token,
    expiresAt: data.expires_at,
  }

  return data.access_token
}

function buildPayload(messages: Message[], settings: ChatSettings) {
  const hasAttachments = messages.some((message) =>
    message.attachments?.some((attachment) => attachment.fileId),
  )
  const hasImageAttachments = messages.some((message) =>
    message.attachments?.some(
      (attachment) => attachment.fileId && attachment.mimeType.startsWith('image/'),
    ),
  )
  const model = hasImageAttachments && settings.model === 'GigaChat'
    ? 'GigaChat-Pro'
    : settings.model

  return {
    model,
    messages: [
      {
        role: 'system',
        content: settings.systemPrompt,
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
        ...(message.attachments?.length
          ? {
              attachments: message.attachments
                .map((attachment) => attachment.fileId)
                .filter((attachment): attachment is string => Boolean(attachment)),
            }
          : {}),
      })),
    ],
    temperature: settings.temperature,
    top_p: settings.topP,
    max_tokens: settings.maxTokens,
    repetition_penalty: settings.repetitionPenalty,
    stream: !hasImageAttachments,
    update_interval: 0,
    ...(hasAttachments && !hasImageAttachments ? { function_call: 'auto' } : {}),
  }
}

async function requestDirect(
  url: string,
  init: RequestInit,
  signal?: AbortSignal,
  useJsonHeaders = true,
) {
  const accessToken = await getAccessToken(signal)
  const headers = new Headers(init.headers)

  headers.set('Accept', 'application/json')
  headers.set('Authorization', `Bearer ${accessToken}`)

  if (useJsonHeaders && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(url, {
    ...init,
    headers,
    signal,
  })
}

export async function requestAvailableModels(signal?: AbortSignal): Promise<ModelName[]> {
  const response = import.meta.env.DEV
    ? await requestDirect(modelsUrl, { method: 'GET' }, signal)
    : await fetch(modelsUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      })

  if (!response.ok) {
    return ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max']
  }

  const data = (await response.json()) as ModelsResponse
  const models = (data.data ?? [])
    .map((model) => model.id)
    .filter(
      (model): model is ModelName =>
        model === 'GigaChat' ||
        model === 'GigaChat-Plus' ||
        model === 'GigaChat-Pro' ||
        model === 'GigaChat-Max',
    )

  return models.length ? models : ['GigaChat', 'GigaChat-Plus', 'GigaChat-Pro', 'GigaChat-Max']
}

export async function uploadAttachment(attachment: PendingAttachment, signal?: AbortSignal) {
  const formData = new FormData()
  formData.append('file', attachment.file, attachment.name)
  formData.append('purpose', 'general')

  const response = import.meta.env.DEV
    ? await requestDirect(filesUrl, { method: 'POST', body: formData }, signal, false)
    : await fetch(filesUrl, {
        method: 'POST',
        body: formData,
        signal,
      })

  if (!response.ok) {
    let errorData: ApiError | undefined

    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = undefined
    }

    throw new Error(getErrorMessage('Не удалось загрузить вложение в GigaChat.', errorData))
  }

  const data = (await response.json()) as UploadResponse

  if (!data.id) {
    throw new Error('GigaChat не вернул идентификатор загруженного файла.')
  }

  return data.id
}

export async function requestChatCompletion(
  messages: Message[],
  settings: ChatSettings,
  onChunk?: (content: string) => void,
  signal?: AbortSignal,
) {
  const payload = buildPayload(messages, settings)
  const useStreaming = payload.stream === true

  if (!import.meta.env.DEV) {
    return requestServerCompletion(payload, onChunk, signal)
  }

  const accessToken = await getAccessToken(signal)
  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: useStreaming ? 'text/event-stream' : 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    let errorData: ApiError | undefined

    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = undefined
    }

    throw new Error(getErrorMessage('Ошибка при запросе к GigaChat API.', errorData))
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (response.body && contentType.includes('text/event-stream')) {
    return readStreamedCompletion(response.body, onChunk, signal)
  }

  const data = (await response.json()) as CompletionResponse
  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('GigaChat вернул пустой ответ.')
  }

  return content
}

async function requestServerCompletion(
  payload: Record<string, unknown>,
  onChunk?: (content: string) => void,
  signal?: AbortSignal,
) {
  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    let errorData: ApiError | undefined

    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = undefined
    }

    throw new Error(getErrorMessage('Ошибка при запросе к серверному GigaChat proxy.', errorData))
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (response.body && contentType.includes('text/event-stream')) {
    return readStreamedCompletion(response.body, onChunk, signal)
  }

  const data = (await response.json()) as CompletionResponse
  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('GigaChat proxy вернул пустой ответ.')
  }

  return content
}

async function requestRestCompletion(
  accessToken: string,
  payload: Record<string, unknown>,
  signal?: AbortSignal,
) {
  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      ...payload,
      stream: false,
    }),
    signal,
  })

  if (!response.ok) {
    let errorData: ApiError | undefined

    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = undefined
    }

    throw new Error(getErrorMessage('Ошибка при запросе к GigaChat API.', errorData))
  }

  const data = (await response.json()) as CompletionResponse
  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) {
    throw new Error('GigaChat вернул пустой ответ.')
  }

  return content
}

async function readStreamedCompletion(
  stream: ReadableStream<Uint8Array>,
  onChunk?: (content: string) => void,
  signal?: AbortSignal,
) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let aggregated = ''

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        const lines = event
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('data:'))

        for (const line of lines) {
          const data = line.slice(5).trim()

          if (!data || data === '[DONE]') {
            continue
          }

          try {
            const parsed = JSON.parse(data) as CompletionResponse
            const delta =
              parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content

            if (!delta) {
              continue
            }

            aggregated += delta
            onChunk?.(aggregated)
          } catch {
            // Ignore malformed chunks and continue reading the stream.
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  const content = aggregated.trim()

  if (!content) {
    throw new Error('GigaChat вернул пустой ответ.')
  }

  return content
}
