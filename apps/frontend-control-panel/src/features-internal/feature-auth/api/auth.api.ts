import { apiClient } from '@/lib/api-client';

export interface LoginResponse {
    success: boolean;
    data?: {
        token: string;
        user: {
            id: string;
            username: string;
            role: string;
        };
    };
    message?: string;
    error?: {
        code: string;
        message: string;
    };
}

export const authApi = {
    login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
        return apiClient.post<LoginResponse>('/login', credentials);
    },
    logout: async (): Promise<{ success: boolean; message?: string }> => {
        return apiClient.post<{ success: boolean; message?: string }>('/logout');
    },
    updateProfile: async (data: { newUsername: string }) => {
        return apiClient.put<any>('/update-profile', data);
    },
    changePassword: async (data: Record<string, string>) => {
        return apiClient.put<any>('/change-password', data);
    },
    getCurrentUser: async () => {
        return apiClient.get<any>('/me');
    }
};
