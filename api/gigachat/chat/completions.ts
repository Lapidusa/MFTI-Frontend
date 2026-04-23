import { fetchWithTimeout, getAccessToken, jsonErrorResponse } from '../shared'

const chatUrl = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'
const completionTimeoutMs = 30_000

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 })
  }

  try {
    const accessToken = await getAccessToken()
    const payload = (await request.json()) as Record<string, unknown>
    const useStreaming = payload.stream === true

    const upstream = useStreaming
      ? await fetch(chatUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        })
      : await fetchWithTimeout(
          chatUrl,
          {
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
          },
          'Timeout while requesting GigaChat completion.',
          completionTimeoutMs,
        )

    if (useStreaming && upstream.body) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('content-type') ?? 'text/event-stream',
          'Cache-Control': 'no-store',
        },
      })
    }

    const responseText = await upstream.text()

    return new Response(responseText, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return jsonErrorResponse(error)
  }
}
