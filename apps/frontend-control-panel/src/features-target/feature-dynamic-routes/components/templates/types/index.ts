// error-templates/types/index.ts
// TypeScript interfaces for Error Templates module

export interface ErrorTemplate {
    id: string;
    scope: 'global' | 'route' | 'category';
    scopeId: string | null;
    statusCode: number;
    template: string;
    isActive: boolean;
}

export interface StatusCodeOption {
    code: number;
    label: string;
}

export interface EditFormState {
    statusCode: number;
    template: string;
}
