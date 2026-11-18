import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiGet } from './client'

describe('apiGet', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('serializes defined query params and forwards AbortSignal', async () => {
    const controller = new AbortController()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    const result = await apiGet<{ status: string }>(
      '/api/customers',
      {
        search: 'acme',
        plan: undefined,
        status: null,
        empty: '',
        page: 2,
      },
      controller.signal,
    )

    expect(result).toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith('/api/customers?search=acme&page=2', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
  })

  it('extracts detail message from JSON error responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Customer "missing" not found.' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(apiGet('/api/customers/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Customer "missing" not found.',
    })
  })

  it('detects HTML responses when backend falls through to SPA HTML', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('<!doctype html><html></html>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    )

    await expect(apiGet('/api/overview')).rejects.toThrowError(
      new ApiError(
        'API returned HTML instead of JSON. Ensure the backend server is running.',
        200,
      ),
    )
  })

  it('throws descriptive ApiError for malformed JSON or non-JSON error responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('{invalid json', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )

    await expect(apiGet('/api/overview')).rejects.toMatchObject({
      status: 200,
      message: 'Received malformed JSON from the API server.',
    })

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Gateway', {
        status: 502,
        headers: { 'content-type': 'text/plain' },
      }),
    )

    await expect(apiGet('/api/overview')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed (502)',
    })
  })
})
