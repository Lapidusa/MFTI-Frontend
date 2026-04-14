type OAuthResponse = {
  access_token: string
  expires_at: number
}

type ApiError = {
  message?: string
}

const oauthUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const chatUrl = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

let tokenCache: { value: string; expiresAt: number } | null = null

function getErrorMessage(fallback: string, data?: ApiError) {
  return data?.message?.trim() || fallback
}

async function getAccessToken() {
  const nowInSeconds = Math.floor(Date.now() / 1000)

  if (tokenCache && tokenCache.expiresAt - 60 > nowInSeconds) {
    return tokenCache.value
  }

  const authKey = process.env.GIGACHAT_AUTH_KEY
  const scope = process.env.GIGACHAT_SCOPE ?? 'GIGACHAT_API_PERS'

  if (!authKey) {
    throw new Error('Server env GIGACHAT_AUTH_KEY is not configured.')
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
  })

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

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 })
  }

  try {
    const accessToken = await getAccessToken()
    const body = await request.text()
    const upstream = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: request.headers.get('accept') ?? 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    })

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.'

    return Response.json({ message }, { status: 500 })
  }
}
