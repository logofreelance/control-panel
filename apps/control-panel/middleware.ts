import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/install'];

// Routes that should redirect to login if accessed without auth


export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes and static files
    if (PUBLIC_ROUTES.includes(pathname) ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')) {
        return NextResponse.next();
    }

    // For all other routes, check for token in cookie
    // Note: In client-side we use localStorage, but middleware can only see cookies
    // So we'll handle this primarily in the dashboard layout

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
