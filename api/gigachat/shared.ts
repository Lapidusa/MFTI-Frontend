type OAuthResponse = {
  access_token: string
  expires_at: number
}

type ApiError = {
  message?: string
}

const oauthUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'

let tokenCache: { value: string; expiresAt: number } | null = null

function getErrorMessage(fallback: string, data?: ApiError) {
  return data?.message?.trim() || fallback
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMessage: string,
  timeoutMs: number,
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(timeoutMessage)
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getAccessToken() {
  const nowInSeconds = Math.floor(Date.now() / 1000)

  if (tokenCache && tokenCache.expiresAt - 60 > nowInSeconds) {
    return tokenCache.value
  }

  const authKey = process.env.GIGACHAT_AUTH_KEY
  const scope = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS'

  if (!authKey) {
    throw new Error('Server env GIGACHAT_AUTH_KEY is not configured.')
  }

  const response = await fetchWithTimeout(
    oauthUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        RqUID: crypto.randomUUID(),
        Authorization: `Basic ${authKey}`,
      },
      body: new URLSearchParams({ scope }),
    },
    'Timeout while obtaining GigaChat access token.',
    2500,
  )

  if (!response.ok) {
    let errorData: ApiError | undefined

    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = undefined
    }

    throw new Error(getErrorMessage('Failed to obtain GigaChat access token.', errorData))
  }

  const data = (await response.json()) as OAuthResponse
  tokenCache = {
    value: data.access_token,
    expiresAt: data.expires_at,
  }

  return data.access_token
}

export function jsonErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected server error.'

  return Response.json({ message }, { status: 500 })
}
