'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Icons, LABELS as L } from '@/lib/config/client';

export default function NotFound() {
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

