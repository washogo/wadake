const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
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
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { error: errorMessage }
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





  // ログアウト
  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', { method: 'POST' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL) 