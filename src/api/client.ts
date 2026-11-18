export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const response = await fetch(url.pathname + url.search, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  const rawText = await response.text()
  const contentType = response.headers.get('content-type') ?? ''

  let parsedBody: unknown = null
  if (rawText.trim().length > 0) {
    try {
      parsedBody = JSON.parse(rawText) as unknown
    } catch {
      if (!response.ok) {
        throw new ApiError(`Request failed (${response.status})`, response.status)
      }
      const preview = rawText.trim().slice(0, 40)
      throw new ApiError(
        contentType.includes('text/html') || preview.startsWith('<')
          ? 'API returned HTML instead of JSON. Ensure the backend server is running.'
          : 'Received malformed JSON from the API server.',
        response.status || 502,
      )
    }
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    if (
      parsedBody &&
      typeof parsedBody === 'object' &&
      'detail' in parsedBody &&
      typeof (parsedBody as { detail?: unknown }).detail === 'string'
    ) {
      detail = (parsedBody as { detail: string }).detail
    }
    throw new ApiError(detail, response.status)
  }

  return parsedBody as T
}
