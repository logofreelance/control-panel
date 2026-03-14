'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@cp/ui';
import { Icons, LABELS as L } from '@cp/config/client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        console.error(error);

        // Check if user has token
        const token = localStorage.getItem('token');
        if (!token) {
            // Not logged in - redirect to login
            router.replace('/login');
            return;
        }
        setIsAuthenticated(true);
    }, [error, router]);

    // While checking auth or redirecting, show nothing
    if (isAuthenticated === null) {
        return null;
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
            <Icons.warning className="w-16 h-16 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-800">{L.common.errors.somethingWentWrong}</h2>
            <p className="text-slate-500 max-w-md text-center">
                {L.common.errors.unexpectedError}
            </p>
            <div className="flex gap-4 mt-4">
                <Button onClick={() => window.location.href = '/'} variant="outline">
                    {L.common.errors.goHome}
                </Button>
                <Button onClick={() => reset()}>
                    {L.common.errors.tryAgain}
                </Button>
            </div>
            {error.digest && (
                <p className="text-xs text-slate-400 font-mono mt-8">{L.common.errors.errorId}{':'} {error.digest}</p>
            )}
        </div>
    );
}


