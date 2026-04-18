'use client';

/**
 * ImportDataModal - Flat Luxury UI Refactor
 * Modal for bulk importing JSON data with persistent context and design standards
 */

import React, { useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { useConfig } from '@/modules/_core';
import { Icons, MODULE_LABELS } from '@/lib/config/client';
import { useImportData } from '../composables';

// Remove top-level L to avoid undefined crashes

interface ImportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    DatabaseTableId: string | number;
    onSuccess: () => void;
}

export function ImportDataModal({
    isOpen,
    onClose,
    DatabaseTableId,
    onSuccess
}: ImportDataModalProps) {
    const { labels, icons: Icons } = useConfig();
    const C = labels?.common || {};
    const L = labels?.mod?.databaseSchema || {};

    const [inputData, setInputData] = useState('');
    const { importing, error, importData } = useImportData(DatabaseTableId);

    if (!isOpen) return null;

    const [parseError, setParseError] = useState<string | null>(null);

    const handleImport = async () => {
        setParseError(null);
        try {
            const parsedData = JSON.parse(inputData);
            const success = await importData(parsedData);
            if (success) {
                onSuccess();
                onClose();
                setInputData('');
            }
        } catch (e: any) {
            setParseError(`JSON format error: ${e.message || 'invalid json'}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-500 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-black/10 p-10 animate-in zoom-in-95 duration-500 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 size-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <div className="relative space-y-8">
                    <header className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                                <Icons.upload className="size-6" />
                            </div>
                            <div>
                                <TextHeading size="h5" className="text-base font-medium lowercase leading-none">{L?.buttons?.importData || 'import data'}</TextHeading>
                                <p className="text-sm text-muted-foreground lowercase mt-2 opacity-60">bulk import records via json data structure</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={onClose} 
                            className="h-10 w-10 rounded-xl hover:bg-muted text-muted-foreground/30"
                        >
                            <Icons.close className="size-5" />
                        </Button>
                    </header>

                    <div className="space-y-4">
                        <div className="relative group">
                            <textarea
                                id="json-input"
                                placeholder={L?.buttons?.importPlaceholder || 'paste your json array here...'}
                                className="w-full h-[320px] font-mono text-sm p-6 rounded-3xl bg-muted/20 border-none focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none lowercase custom-scrollbar"
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                <Badge variant="secondary" className="bg-background text-xs font-normal lowercase border-none px-3 py-1 opacity-40">json array</Badge>
                            </div>
                        </div>
                        
                        {(error || parseError) && (
                            <div className="p-4 rounded-2xl bg-rose-500/5 ring-1 ring-rose-500/10 flex items-start gap-4 animate-in slide-in-from-top-2">
                                <Icons.warning className="size-4 text-rose-500 mt-0.5" />
                                <p className="text-sm font-normal text-rose-600/80 lowercase">{error || parseError}</p>
                            </div>
                        )}
                    </div>

                    <footer className="flex items-center justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={importing}
                        >
                            {C?.actions?.cancel || 'cancel'}
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={importing || !inputData.trim()}
                            isLoading={importing}
                        >
                            {(L?.buttons?.importData || 'import data').toLowerCase()}
                        </Button>
                    </footer>
                </div>
            </div>
        </div>
    );
}
