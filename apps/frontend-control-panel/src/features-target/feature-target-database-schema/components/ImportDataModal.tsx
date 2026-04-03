// ImportDataModal - Modal for bulk importing JSON data
// ✅ PURE DI: Uses useConfig() hook for labels

import React, { useState } from 'react';
import { Button, Heading, Text, Stack } from '@/components/ui';
import { useConfig } from '@/modules/_core';
import { useImportData } from '../composables';

interface ImportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    DatabaseTableId: number;
    onSuccess: () => void;
}

export function ImportDataModal({
    isOpen,
    onClose,
    DatabaseTableId,
    onSuccess
}: ImportDataModalProps) {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.databaseSchema;
    const C = labels.common;

    const [inputData, setInputData] = useState('');
    const { importing, error, importData } = useImportData(DatabaseTableId);

    if (!isOpen) return null;

    const handleImport = async () => {
        try {
            const parsedData = JSON.parse(inputData);
            const success = await importData(parsedData);
            if (success) {
                onSuccess();
                onClose();
                setInputData('');
            }
        } catch {
            // JSON parse error is handled internally
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-2xl rounded-4xl p-8 animate-in zoom-in-95 duration-300">
                <Stack direction="col">
                    <Stack direction="row" justify="between" align="center" className="mb-6">
                        <Heading level={5}>{L.buttons.importData}</Heading>
                        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Icons.close className="w-6 h-6" />
                        </button>
                    </Stack>

                    <div className="space-y-4 mb-8">
                        <div className="space-y-2">
                            <label htmlFor="json-input" className="text-sm font-medium text-foreground">{C.table.type}</label>
                            <textarea
                                id="json-input"
                                placeholder={L.buttons.importPlaceholder}
                                className="w-full h-[300px] font-mono text-sm p-4 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                            />
                        </div>
                        {error && <Text variant="muted" className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</Text>}
                    </div>

                    <Stack direction="row" justify="end" gap={3}>
                        <Button variant="outline" onClick={onClose} disabled={importing}>
                            {C.actions.cancel}
                        </Button>
                        <Button onClick={handleImport} disabled={importing || !inputData.trim()} isLoading={importing}>
                            {L.buttons.importData}
                        </Button>
                    </Stack>
                </Stack>
            </div>
        </div>
    );
}
