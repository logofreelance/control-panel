import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Ignore internal next paths and public assets
    if (pathname.startsWith('/_next') || pathname.includes('.') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('auth_session');
    const hasSession = !!(sessionCookie && sessionCookie.value);

    console.log(`[MIDDLEWARE] Path: ${pathname} | HasSession: ${hasSession}`);

    // LOGIC: If on login/install page
    if (pathname === '/login' || pathname === '/install') {
        if (hasSession) {
            console.log(`[MIDDLEWARE] Redirecting from ${pathname} to dashboard (/) because session exists`);
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // LOGIC: Protect everything else (Dashboard)
    if (!hasSession) {
        console.log(`[MIDDLEWARE] Unauthorized access to ${pathname} | Redirecting to /login`);
        return NextResponse.redirect(new URL('/login', request.url));
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
