import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isDashboardPath = request.nextUrl.pathname.startsWith('/(dashboard)') || request.nextUrl.pathname === '/' || !['/login', '/install', '/_next'].some(p => request.nextUrl.pathname.startsWith(p));
    
    // Allow public API or static files
    if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('auth_session');
    const hasSession = sessionCookie && sessionCookie.value && sessionCookie.value.length > 0;

    // Always allow login and install
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/install') {
        if (hasSession && request.nextUrl.pathname === '/login') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Protect all other dashboard routes
    if (isDashboardPath) {
        if (!hasSession) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
