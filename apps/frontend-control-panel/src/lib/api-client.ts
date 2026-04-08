import { env } from './env';

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

class ApiClient {
    // Resolve baseUrl dynamically at request time (not at module load)
    private get baseUrl(): string {
        return env.API_URL;
    }

    private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const urlStr = `${this.baseUrl}${endpoint}`;
        // Jika urlStr adalah path relatif (misal '/api/login'), kita harus menyediakan base URL 
        // agar 'new URL()' tidak melempar error "Invalid URL".
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const url = urlStr.startsWith('http') ? new URL(urlStr) : new URL(urlStr, base);
        
        if (options.params) {
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, value.toString());
                }
            });
        }

        const headers = new Headers(options.headers);
        if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        // Extremely important for Lucia Auth / HttpOnly Cookies
        const fetchOptions: RequestInit = {
            ...options,
            headers,
            credentials: 'include', // Automatically send and receive cookies from backend
        };

        const response = await fetch(url.toString(), fetchOptions);

        if (response.status === 401) {
            // Only redirect if we are NOT already on the login page
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            // If we ARE on login page, let the caller handle it (show error message)
            if (response.headers.get('Content-Type')?.includes('application/json')) {
                const data = await response.json();
                return data;
            }
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        return data as T;
    }

    public get<T>(endpoint: string, options?: Omit<FetchOptions, 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public post<T>(endpoint: string, body?: any, options?: Omit<FetchOptions, 'body'>) {
        return this.request<T>(endpoint, { 
            ...options, 
            method: 'POST', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        });
    }

    public put<T>(endpoint: string, body?: any, options?: Omit<FetchOptions, 'body'>) {
        return this.request<T>(endpoint, { 
            ...options, 
            method: 'PUT', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        });
    }

    public delete<T>(endpoint: string, options?: Omit<FetchOptions, 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
