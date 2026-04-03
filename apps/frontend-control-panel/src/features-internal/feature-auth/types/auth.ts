export interface AuthUser {
    id: string;
    username: string;
    role: string;
}

export interface FormStatus {
    loading?: boolean;
    message?: string;
    type?: 'success' | 'error';
}

export interface ProfileFormData {
    newUsername: string;
}

export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
