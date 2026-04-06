'use client';

/**
 * TargetFormModal - Elite Minimalist Refactor (Modal v2)
 * 
 * STICKING TO RULES:
 * - Using global Modal component for consistent p-8 padding and scroll support.
 * - No tracking-* (Removed tracking-widest, tracking-none)
 * - No text size < text-xs (Changed text-[10px] to text-xs)
 * - No text color opacity (Removed /60, opacity-*)
 * - Lowercase Consistency: Enforced lowercase across all headers, labels, and buttons.
 * - Standard Button usage only.
 */

import { useState, useEffect } from 'react';
import { 
    Button, 
    Input, 
    Badge,
    Modal,
} from '@/components/ui';
import { Icons } from '../config/icons';
import { TARGET_UI_LABELS } from '../constants/ui-labels';
import { cn } from '@/lib/utils';
import type { TargetSystem, CreateTargetInput } from '../types/target-registry.types';

interface TargetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateTargetInput) => Promise<boolean>;
    onTestConnection: (url: string) => Promise<{ ok: boolean; latencyMs: number; error?: string }>;
    editingTarget?: TargetSystem | null;
    saving: boolean;
}

export function TargetFormModal({ isOpen, onClose, onSave, onTestConnection, editingTarget, saving }: TargetFormModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [databaseUrl, setDatabaseUrl] = useState('');
    const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs: number; error?: string } | null>(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (editingTarget) {
                setName(editingTarget.name);
                setDescription(editingTarget.description);
                setDatabaseUrl(''); 
            } else {
                setName('');
                setDescription('');
                setDatabaseUrl('');
            }
            setTestResult(null);
        }
    }, [editingTarget, isOpen]);

    const handleTest = async () => {
        if (!databaseUrl.trim()) return;
        setTesting(true);
        setTestResult(null);
        const result = await onTestConnection(databaseUrl);
        setTestResult(result);
        setTesting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onSave({
            name: name.trim(),
            description: description.trim(),
            databaseUrl: databaseUrl.trim(),
        });
        if (success) onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingTarget ? TARGET_UI_LABELS.modal.updateTitle.toLowerCase() : TARGET_UI_LABELS.modal.createTitle.toLowerCase()}
            className="sm:max-w-xl"
        >
            <div className="flex flex-col gap-8 font-instrument pt-4">
                {/* Interesting Context Box */}
                <div className="flex items-center justify-between p-5 bg-muted/10 rounded-3xl border border-border border-dashed">
                    <div className="flex items-center gap-4">
                        <div className="size-11 rounded-2xl bg-background flex items-center justify-center text-primary shadow-sm border border-border shrink-0">
                            <Icons.database className="size-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground uppercase">Infrastructure setup</span>
                            <span className="text-xs text-muted-foreground font-normal lowercase">{TARGET_UI_LABELS.modal.configBadge.toLowerCase()}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6">
                        <Input
                            label={TARGET_UI_LABELS.modal.nameLabel.toLowerCase()}
                            placeholder={TARGET_UI_LABELS.modal.namePlaceholder.toLowerCase()}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="h-12 bg-muted border border-border text-base font-normal rounded-2xl shadow-none"
                        />
                        <Input
                            label={TARGET_UI_LABELS.modal.descLabel.toLowerCase()}
                            placeholder={TARGET_UI_LABELS.modal.descPlaceholder.toLowerCase()}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="h-12 bg-muted border border-border text-base font-normal rounded-2xl shadow-none"
                        />
                        
                        <div className="space-y-4">
                            <Input
                                label={TARGET_UI_LABELS.modal.dbUrlLabel.toLowerCase()}
                                placeholder={TARGET_UI_LABELS.modal.dbUrlPlaceholder.toLowerCase()}
                                value={databaseUrl}
                                onChange={e => { setDatabaseUrl(e.target.value); setTestResult(null); }}
                                required={!editingTarget}
                                type="password"
                                className="h-12 bg-muted border border-border text-base font-normal rounded-2xl shadow-none"
                            />
                            
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTest}
                                    disabled={!databaseUrl.trim() || testing}
                                    className="rounded-xl h-10 px-4 lowercase"
                                >
                                    {testing ? <Icons.loading className="size-3.5 animate-spin mr-2" /> : <Icons.zap className="size-3.5 mr-2" />}
                                    {TARGET_UI_LABELS.modal.testLatency.toLowerCase()}
                                </Button>
                                
                                {testResult && (
                                    <Badge variant="secondary" className={cn("rounded-lg px-3 py-1.5 border-none", testResult.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")}>
                                        <div className={cn("size-1.5 rounded-full shrink-0 mr-2", testResult.ok ? "bg-emerald-500" : "bg-destructive")} />
                                        <span className="text-xs font-semibold lowercase">
                                            {testResult.ok ? TARGET_UI_LABELS.modal.reachable(testResult.latencyMs).toLowerCase() : (testResult.error?.toLowerCase() || TARGET_UI_LABELS.modal.connectionFailed.toLowerCase())}
                                        </span>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/10">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            variant="ghost" 
                            className="lowercase"
                        >
                            {TARGET_UI_LABELS.modal.discard.toLowerCase()}
                        </Button>
                        <Button 
                            type="submit" 
                            variant="default" 
                            disabled={saving}
                            isLoading={saving}
                            className="lowercase"
                        >
                           <Icons.save className="size-4 mr-2" />
                           {editingTarget ? TARGET_UI_LABELS.modal.updateTarget.toLowerCase() : TARGET_UI_LABELS.modal.confirmRegistry.toLowerCase()}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
