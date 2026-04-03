// API module types

export interface ApiKey {
    id: number;
    name: string;
    key: string;
    roles?: string;
    permissions?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CorsDomain {
    id: number;
    domain: string;
    isActive: boolean;
    createdAt: string;
}

export interface ConfirmDialogState {
    type: 'api-keys' | 'cors';
    id: number;
    name: string;
}
