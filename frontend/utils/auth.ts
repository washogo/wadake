import { createClient } from './supabase/client'
import { apiClient } from './api'

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

class AuthManager {
  private supabase = createClient()



  // 認証状態を初期化
  async initializeAuth(): Promise<AuthState> {
    try {
      // Supabaseセッションを確認
      const { data: { session } } = await this.supabase.auth.getSession()
      
      if (!session) {
        return { user: null, isLoading: false, error: null }
      }



      // バックエンドトークンを取得
      console.log('AuthManager - Getting backend token for user:', session.user)
      const { data: tokenData, error: tokenError } = await apiClient.getToken({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown User'
      })
      
      if (tokenError || !tokenData) {
        console.error('AuthManager - Token error:', tokenError, 'Token data:', tokenData)
        return { user: null, isLoading: false, error: tokenError || 'トークンの取得に失敗しました' }
      }

      return { user: tokenData.user, isLoading: false, error: null }
    } catch (error) {
      return { user: null, isLoading: false, error: `${JSON.stringify(error)}` }
    }
  }

  // Googleログイン
  async signInWithGoogle(): Promise<{ error?: string }> {
    try {
      // Googleログイン成功後にトップ画面に遷移する
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_PATH
        }
      })

      return { error: error?.message }
    } catch (error) {
      return { error: `ログイン中にエラーが発生しました: ${error}` }
    }
  }

  // ログアウト
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut()
    
    // バックエンドのログアウトAPIを呼び出してCookieを削除
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    }
  }

  // 認証状態の変更を監視
  onAuthStateChange(callback: (state: AuthState) => void) {
    return this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // バックエンドトークンを取得
        console.log('AuthManager - SIGNED_IN event, getting token for user:', session.user)
        const { data, error } = await apiClient.getToken({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Unknown User'
        })
        
        if (data && !error) {
          console.log('AuthManager - Token received successfully')
          callback({ user: data.user, isLoading: false, error: null })
        } else {
          console.error('AuthManager - Token error in SIGNED_IN:', error)
          callback({ user: null, isLoading: false, error: 'トークンの取得に失敗しました' })
        }
      } else if (event === 'SIGNED_OUT') {
        callback({ user: null, isLoading: false, error: null })
      }
    })
  }
}

export const authManager = new AuthManager() 