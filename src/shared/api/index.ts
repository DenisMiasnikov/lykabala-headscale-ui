type RequestConfig = {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
}

type ApiConfig = RequestConfig & {
  baseUrl: string
}

class ApiInstance {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor({ baseUrl, headers = {} }: ApiConfig) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    }
  }

  private buildUrl(path: string, params?: RequestConfig['params']): string {
    const url = new URL(path, this.baseUrl)

    if (params) {
      Object.entries(params).forEach(([k, v]) =>
        url.searchParams.set(k, String(v))
      )
    }

    return url.toString()
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown
      params?: RequestConfig['params']
      headers?: Record<string, string>
    } = {}
  ): Promise<T> {
    const { body, params, headers } = options

    const res = await fetch(this.buildUrl(path, params), {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }))
      throw new ApiError(res.status, error.message ?? res.statusText, error)
    }

    // 204 No Content — nothing to parse
    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  }

  get<T>(path: string, config?: RequestConfig) {
    return this.request<T>('GET', path, config)
  }

  post<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>('POST', path, { ...config, body })
  }

  patch<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>('PATCH', path, { ...config, body })
  }

  put<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>('PUT', path, { ...config, body })
  }

  delete<T = void>(path: string, config?: RequestConfig) {
    return this.request<T>('DELETE', path, config)
  }

  // Returns a new instance with merged headers — useful for auth tokens
  withHeaders(headers: Record<string, string>): ApiInstance {
    return new ApiInstance({
      baseUrl: this.baseUrl,
      headers: { ...this.defaultHeaders, ...headers },
    })
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiInstance = new ApiInstance({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
})
