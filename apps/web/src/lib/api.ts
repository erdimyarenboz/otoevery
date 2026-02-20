const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

class ApiClient {
    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
    }

    clearToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    async request<T = any>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
            const data = await res.json();

            if (res.status === 401) {
                this.clearToken();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }

            return data;
        } catch (error: any) {
            return { success: false, message: error.message || 'Bağlantı hatası' };
        }
    }

    get<T = any>(path: string) {
        return this.request<T>(path);
    }

    post<T = any>(path: string, body: any) {
        return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
    }

    put<T = any>(path: string, body: any) {
        return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
    }

    delete<T = any>(path: string) {
        return this.request<T>(path, { method: 'DELETE' });
    }

    // Auth helpers
    async login(credentials: { email?: string; plateNumber?: string; password: string }) {
        const res = await this.post<{ token: string; user: any }>('/api/v1/auth/login', credentials);
        if (res.success && res.data) {
            this.setToken(res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        return res;
    }

    logout() {
        this.clearToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    getUser() {
        if (typeof window === 'undefined') return null;
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    }
}

export const api = new ApiClient();
