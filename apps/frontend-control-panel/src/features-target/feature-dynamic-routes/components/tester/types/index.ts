// api-tester/types/index.ts
// TypeScript interfaces for API Tester module

export interface RequestHistory {
    id: string;
    method: string;
    url: string;
    status: number;
    time: number;
    timestamp: Date;
}

export interface Header {
    key: string;
    value: string;
    enabled: boolean;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
