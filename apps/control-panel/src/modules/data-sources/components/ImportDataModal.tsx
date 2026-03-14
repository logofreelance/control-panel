// ImportDataModal - Modal for bulk importing JSON data
// ✅ PURE DI: Uses useConfig() hook for labels

import React, { useState } from 'react';
import { Button } from '@cp/ui';
import { useConfig } from '@/modules/_core';
import { useImportData } from '../composables';

interface ImportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    dataSourceId: number;
    onSuccess: () => void;
}

export function ImportDataModal({
    isOpen,
    onClose,
    dataSourceId,
    onSuccess
}: ImportDataModalProps) {
    // ✅ Pure DI: Get all dependencies from context
    const { labels, icons: Icons } = useConfig();
    const L = labels.mod.dataSources;
    const C = labels.common;

    const [inputData, setInputData] = useState('');
    const { importing, error, importData } = useImportData(dataSourceId);

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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">{L.buttons.importData}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <Icons.close className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="space-y-2">
                            <label htmlFor="json-input" className="text-sm font-medium text-slate-700">{C.table.type}</label>
                            <textarea
                                id="json-input"
                                placeholder={L.buttons.importPlaceholder}
                                className="w-full h-[300px] font-mono text-sm p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="slate" onClick={onClose} disabled={importing}>
                            {C.actions.cancel}
                        </Button>
                        <Button onClick={handleImport} disabled={importing || !inputData.trim()} isLoading={importing}>
                            {L.buttons.importData}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
