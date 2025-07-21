const PROXY_BASE_URL = '/api/proxy';
const AUTH_BASE_URL = '/api/proxy/auth';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private proxyBaseUrl: string;
  private authBaseUrl: string;

  constructor(proxyBaseUrl: string, authBaseUrl: string) {
    this.proxyBaseUrl = proxyBaseUrl;
    this.authBaseUrl = authBaseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const baseUrl = useAuth ? this.authBaseUrl : this.proxyBaseUrl;
    const url = `${baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Cookieを自動送信
    };

    try {
      const response = await fetch(url, fetchOptions);

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'API request failed' };
      }

      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { error: errorMessage };
    }
  }

  // 認証トークンの取得
  async getToken(user: { id: string; email: string; name: string }) {
    console.log('ApiClient - Calling /api/auth/token with user:', user);
    const result = await this.request<{ token: string; user: { id: string; email: string; name: string } }>(
      '/token',
      {
        method: 'POST',
        body: JSON.stringify({ user }),
      },
      true
    ); // useAuth = true
    console.log('ApiClient - /api/auth/token result:', result);
    return result;
  }

  // ログアウト
  async logout() {
    return this.request<{ message: string }>('/logout', { method: 'POST' }, true); // useAuth = true
  }

  // 収入一覧取得
  async getIncomes(groupId?: string) {
    if (groupId) {
      return this.request(`/groups/${groupId}/incomes`);
    }
    return this.request('/incomes');
  }

  // 収入登録
  async createIncome(data: { categoryId: string; amount: number; memo?: string; date: string; groupId?: string; userId?: string }) {
    if (data.groupId) {
      return this.request(`/groups/${data.groupId}/incomes`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    return this.request('/incomes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 収入更新
  async updateIncome(
    id: string,
    data: {
      categoryId: string;
      amount: number;
      memo?: string;
      date: string;
      groupId?: string;
      userId?: string;
    }
  ) {
    if (data.groupId) {
      return this.request(`/groups/${data.groupId}/incomes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    return this.request(`/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 収入削除
  async deleteIncome(id: string, groupId?: string) {
    if (groupId) {
      return this.request(`/groups/${groupId}/incomes/${id}`, {
        method: 'DELETE',
      });
    }
    return this.request(`/incomes/${id}`, {
      method: 'DELETE',
    });
  }

  // 収入カテゴリ取得
  async getIncomeCategories() {
    return this.request<
      Array<{
        id: string;
        name: string;
        type: string;
        createdAt: string;
        updatedAt: string;
      }>
    >('/categories/income');
  }

  // 支出一覧取得
  async getExpenses(groupId?: string) {
    if (groupId) {
      return this.request(`/groups/${groupId}/expenses`);
    }
    return this.request<
      Array<{
        id: string;
        amount: number;
        description: string | null;
        date: string;
        category: {
          id: string;
          name: string;
          type: string;
        };
        createdAt: string;
        updatedAt: string;
      }>
    >('/expenses');
  }

  // 支出登録
  async createExpense(data: {
    categoryId: string;
    amount: number;
    description?: string;
    date: string;
    groupId?: string;
    userId?: string;
  }) {
    if (data.groupId) {
      return this.request(`/groups/${data.groupId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    return this.request<{
      id: string;
      amount: number;
      description: string | null;
      date: string;
      category: {
        id: string;
        name: string;
        type: string;
      };
      createdAt: string;
      updatedAt: string;
    }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 支出更新
  async updateExpense(
    id: string,
    data: {
      categoryId: string;
      amount: number;
      description?: string;
      date: string;
      groupId?: string;
      userId?: string;
    }
  ) {
    if (data.groupId) {
      return this.request(`/groups/${data.groupId}/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    return this.request<{
      id: string;
      amount: number;
      description: string | null;
      date: string;
      category: {
        id: string;
        name: string;
        type: string;
      };
      createdAt: string;
      updatedAt: string;
    }>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // 支出削除
  async deleteExpense(id: string, groupId?: string) {
    if (groupId) {
      return this.request(`/groups/${groupId}/expenses/${id}`, {
        method: 'DELETE',
      });
    }
    return this.request<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // 支出カテゴリ取得
  async getExpenseCategories() {
    return this.request<
      Array<{
        id: string;
        name: string;
        type: string;
        createdAt: string;
        updatedAt: string;
      }>
    >('/categories/expense');
  }

  // グループ一覧取得
  async getGroups(userId: string) {
    return this.request<Array<{ id: string; name: string }>>(`/groups/user/${userId}`);
  }

  // グループ作成
  async createGroup(data: { name: string; userId: string }) {
    return this.request<{ id: string; name: string }>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // グループメンバー一覧取得
  async getGroupMembers(groupId: string) {
    return this.request<
      Array<{
        userId: string;
        groupId: string;
        role: string;
        user: {
          id: string;
          name: string;
        };
      }>
    >(`/groups/${groupId}/members`);
  }

  // メンバー招待
  async inviteGroupMember(groupId: string, data: { userId: string; role: string }) {
    return this.request<{
      userId: string;
      groupId: string;
      role: string;
    }>(`/groups/${groupId}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(PROXY_BASE_URL, AUTH_BASE_URL);
