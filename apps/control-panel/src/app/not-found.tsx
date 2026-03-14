'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@cp/ui';
import { Icons, LABELS as L } from '@cp/config/client';

export default function NotFound() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if user has token
        const token = localStorage.getItem('token');
        if (!token) {
            // Not logged in - redirect to login, don't show not-found
            router.replace('/login');
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

    // While checking auth or redirecting, show nothing
    if (isAuthenticated === null) {
        return null;
    }

    // Only show not-found page if user is authenticated
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
            <Icons.search className="w-16 h-16 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-800">{L.common.notFound.title}</h2>
            <p className="text-slate-500 max-w-md text-center">
                {L.common.notFound.description}
            </p>
            <div className="mt-6">
                <Link href="/">
                    <Button>{L.common.notFound.backToHome}</Button>
                </Link>
            </div>
        </div>
    );
}

