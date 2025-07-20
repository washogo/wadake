const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      // Type assertion to allow setting Authorization header
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Cookieを自動送信
    }

    try {
      const response = await fetch(url, fetchOptions)

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'API request failed' }
      }

      return { data }
    } catch (error) {
      return { error: `${JSON.stringify(error)}` }
    }
  }

  // 認証トークンの取得
  async getToken(user: any) {
    console.log('ApiClient - Calling /api/auth/token with user:', user)
    const result = await this.request<{ token: string; user: any }>('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify({ user }),
    })
    console.log('ApiClient - /api/auth/token result:', result)
    return result
  }

  // ユーザー情報の取得
  async getMe() {
    return this.request<{ authenticated: boolean; user: any }>('/api/auth/me')
  }

  // ヘルスチェック
  async health() {
    return this.request<{ status: string; database: string }>('/health')
  }

  // ログアウト
  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', { method: 'POST' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL) 