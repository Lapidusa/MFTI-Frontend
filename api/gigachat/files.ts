import { fetchWithTimeout, getAccessToken, jsonErrorResponse } from './shared'

const filesUrl = 'https://gigachat.devices.sberbank.ru/api/v1/files'

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 })
  }

  try {
    const accessToken = await getAccessToken()
    const formData = await request.formData()
    const upstream = await fetchWithTimeout(
      filesUrl,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
      'Timeout while uploading a file to GigaChat.',
      30_000,
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
