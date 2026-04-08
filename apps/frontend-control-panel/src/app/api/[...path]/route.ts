import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL 
    || process.env.NEXT_PUBLIC_API_URL 
    || 'http://localhost:3001';

export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/api/${pathString}${url.search}`;
    
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    try {
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers,
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('[API_PROXY] GET Error:', error.message);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Backend unreachable' 
        }, { status: 502 });
    }
}

export async function POST(
    request: NextRequest, 
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    const backendUrl = `${BACKEND_URL}/api/${pathString}`;
    
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    const body = await request.text();

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers,
            body,
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('[API_PROXY] POST Error:', error.message);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Backend unreachable' 
        }, { status: 502 });
    }
}

export async function PUT(
    request: NextRequest, 
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    const backendUrl = `${BACKEND_URL}/api/${pathString}`;
    
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    const body = await request.text();

    try {
        const response = await fetch(backendUrl, {
            method: 'PUT',
            headers,
            body,
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('[API_PROXY] PUT Error:', error.message);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Backend unreachable' 
        }, { status: 502 });
    }
}

export async function DELETE(
    request: NextRequest, 
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/api/${pathString}${url.search}`;
    
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    try {
        const response = await fetch(backendUrl, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('[API_PROXY] DELETE Error:', error.message);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Backend unreachable' 
        }, { status: 502 });
    }
}

export async function PATCH(
    request: NextRequest, 
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    const backendUrl = `${BACKEND_URL}/api/${pathString}`;
    
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });

    const body = await request.text();

    try {
        const response = await fetch(backendUrl, {
            method: 'PATCH',
            headers,
            body,
            credentials: 'include',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('[API_PROXY] PATCH Error:', error.message);
        return NextResponse.json({ 
            status: 'error', 
            message: 'Backend unreachable' 
        }, { status: 502 });
    }
}