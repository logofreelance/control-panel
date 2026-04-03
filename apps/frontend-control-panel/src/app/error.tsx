'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Icons, LABELS as L } from '@/lib/config/client';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();
    useEffect(() => {
        console.error(error);
    }, [error]);

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


