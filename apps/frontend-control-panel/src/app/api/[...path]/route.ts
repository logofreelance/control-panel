import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL 
    || process.env.NEXT_PUBLIC_API_URL 
    || 'http://localhost:3001';

export const dynamic = 'force-dynamic';

/**
 * Safely parse response — if backend returns non-JSON (e.g. plain text errors),
 * wrap it into a JSON error object instead of crashing with SyntaxError.
 */
async function safeParseResponse(response: Response): Promise<{ data: any; nextResponse: NextResponse }> {
    const contentType = response.headers.get('Content-Type') || '';
    
    if (!contentType.includes('application/json')) {
        const text = await response.text();
        const data = { 
            success: false, 
            error: { code: 'INVALID_RESPONSE', message: text || 'Backend returned non-JSON response' } 
        };
        const nextResponse = NextResponse.json(data, { 
            status: response.status >= 400 ? response.status : 502 
        });
        return { data, nextResponse };
    }

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });
    return { data, nextResponse };
}

/**
 * Forward Set-Cookie headers from backend response to the client.
 */
function forwardCookies(backendResponse: Response, nextResponse: NextResponse): void {
    const setCookieHeaders = backendResponse.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
        for (const cookie of setCookieHeaders) {
            nextResponse.headers.append('Set-Cookie', cookie);
        }
    }
}

/**
 * Build forwarded headers (strip 'host' to avoid conflicts).
 */
function buildForwardedHeaders(request: NextRequest): Headers {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'host') {
            headers.set(key, value);
        }
    });
    return headers;
}

export async function GET(
    request: NextRequest, 
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    const url = new URL(request.url);
    const backendUrl = `${BACKEND_URL}/api/${pathString}${url.search}`;
    const headers = buildForwardedHeaders(request);

    try {
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers,
            credentials: 'include',
            cache: 'no-store'
        });

        const { nextResponse } = await safeParseResponse(response);
        forwardCookies(response, nextResponse);
        return nextResponse;
    } catch (error: any) {
        console.error('[API_PROXY] GET Error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: { code: 'BACKEND_UNREACHABLE', message: 'Backend unreachable' }
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
    const headers = buildForwardedHeaders(request);
    const body = await request.text();

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers,
            body,
            credentials: 'include',
        });

        const { nextResponse } = await safeParseResponse(response);
        forwardCookies(response, nextResponse);
        return nextResponse;
    } catch (error: any) {
        console.error('[API_PROXY] POST Error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: { code: 'BACKEND_UNREACHABLE', message: 'Backend unreachable' }
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
    const headers = buildForwardedHeaders(request);
    const body = await request.text();

    try {
        const response = await fetch(backendUrl, {
            method: 'PUT',
            headers,
            body,
            credentials: 'include',
        });

        const { nextResponse } = await safeParseResponse(response);
        forwardCookies(response, nextResponse);
        return nextResponse;
    } catch (error: any) {
        console.error('[API_PROXY] PUT Error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: { code: 'BACKEND_UNREACHABLE', message: 'Backend unreachable' }
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
    const headers = buildForwardedHeaders(request);

    try {
        const response = await fetch(backendUrl, {
            method: 'DELETE',
            headers,
            credentials: 'include',
        });

        const { nextResponse } = await safeParseResponse(response);
        forwardCookies(response, nextResponse);
        return nextResponse;
    } catch (error: any) {
        console.error('[API_PROXY] DELETE Error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: { code: 'BACKEND_UNREACHABLE', message: 'Backend unreachable' }
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
    const headers = buildForwardedHeaders(request);
    const body = await request.text();

    try {
        const response = await fetch(backendUrl, {
            method: 'PATCH',
            headers,
            body,
            credentials: 'include',
        });

        const { nextResponse } = await safeParseResponse(response);
        forwardCookies(response, nextResponse);
        return nextResponse;
    } catch (error: any) {
        console.error('[API_PROXY] PATCH Error:', error.message);
        return NextResponse.json({ 
            success: false, 
            error: { code: 'BACKEND_UNREACHABLE', message: 'Backend unreachable' }
        }, { status: 502 });
    }
}