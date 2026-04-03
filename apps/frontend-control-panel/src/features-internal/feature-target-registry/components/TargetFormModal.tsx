'use client';

import { useState, useEffect } from 'react';
import { 
    Button, 
    Input, 
    Badge,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/40 bg-background rounded-xl shadow-none ring-0 outline-none">
                <DialogHeader className="p-8 pb-0">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="size-12 rounded-xl bg-foreground text-background flex items-center justify-center shadow-none">
                            <Icons.database className="size-6" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <TextHeading size="h4" className="tracking-none">
                                {editingTarget ? TARGET_UI_LABELS.modal.updateTitle : TARGET_UI_LABELS.modal.createTitle}
                            </TextHeading>
                            <p className="text-[10px] font-medium uppercase text-muted-foreground/60 tracking-widest">
                                {TARGET_UI_LABELS.modal.configBadge}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-8 space-y-8">
                    <div className="space-y-6">
                        <Input
                            label={TARGET_UI_LABELS.modal.nameLabel}
                            placeholder={TARGET_UI_LABELS.modal.namePlaceholder}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                        <Input
                            label={TARGET_UI_LABELS.modal.descLabel}
                            placeholder={TARGET_UI_LABELS.modal.descPlaceholder}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                        
                        <div className="space-y-4">
                            <Input
                                label={TARGET_UI_LABELS.modal.dbUrlLabel}
                                placeholder={TARGET_UI_LABELS.modal.dbUrlPlaceholder}
                                value={databaseUrl}
                                onChange={e => { setDatabaseUrl(e.target.value); setTestResult(null); }}
                                required={!editingTarget}
                                type="password"
                                className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            />
                            
                            <div className="flex items-center justify-between gap-4 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTest}
                                    disabled={!databaseUrl.trim() || testing}
                                    className="border-border/60 hover:bg-primary/5 hover:border-primary/40 h-10 px-4 transition-all"
                                >
                                    {testing ? <Icons.loading className="size-3 animate-spin mr-2" /> : <Icons.zap className="size-3 mr-2" />}
                                    <span className="text-xs font-semibold uppercase">{TARGET_UI_LABELS.modal.testLatency}</span>
                                </Button>
                                
                                {testResult && (
                                    <Badge variant="outline" className={cn("rounded-lg px-3 py-1.5 border-none", testResult.ok ? "bg-chart-2/10 text-chart-2" : "bg-destructive/10 text-destructive")}>
                                        <div className={cn("size-1.5 rounded-full shrink-0 mr-2", testResult.ok ? "bg-chart-2" : "bg-destructive")} />
                                        <span className="text-[10px] font-semibold uppercase">
                                            {testResult.ok ? TARGET_UI_LABELS.modal.reachable(testResult.latencyMs) : (testResult.error || TARGET_UI_LABELS.modal.connectionFailed)}
                                        </span>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-border/40 bg-background">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            variant="outline" 
                            size="default"
                            className="w-full sm:flex-1 text-muted-foreground transition-all"
                        >
                            {TARGET_UI_LABELS.modal.discard}
                        </Button>
                        <Button 
                            type="submit" 
                            variant="default" 
                            size="default"
                            disabled={saving}
                            className="w-full sm:flex-1 shadow-none transition-all"
                        >
                            {saving ? <Icons.loading className="size-3.5 animate-spin mr-2" /> : <Icons.save className="size-3.5 mr-2" />}
                            {editingTarget ? TARGET_UI_LABELS.modal.updateTarget : TARGET_UI_LABELS.modal.confirmRegistry}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
