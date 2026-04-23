import { fetchWithTimeout, getAccessToken, jsonErrorResponse } from './shared'

const modelsUrl = 'https://gigachat.devices.sberbank.ru/api/v1/models'

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 })
  }

  try {
    const accessToken = await getAccessToken()
    const upstream = await fetchWithTimeout(
      modelsUrl,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
      'Timeout while loading GigaChat models.',
      6000,
    )

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
