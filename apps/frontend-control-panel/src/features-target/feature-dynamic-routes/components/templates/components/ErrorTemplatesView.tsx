'use client';

import { Button, Badge, Input, Card, CardContent } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useErrorTemplates, STATUS_CODES } from '../composables';

const L = DYNAMIC_ROUTES_LABELS.errorTemplates;

export const ErrorTemplatesView = ({ targetId }: { targetId?: string }) => {
    const {
        loading,
        editingId,
        editForm,
        setEditForm,
        handleSave,
        handleDelete,
        startEdit,
        startNew,
        cancelEdit,
        saveCustomCode,
        getStatusColor,
        getTemplateForCode,
    } = useErrorTemplates(targetId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-row items-center gap-4">
                <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-none border-none">
                    <Icons.error className="size-6" />
                </div>
                <div>
                    <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase tracking-tight">
                        {L.title || "error protocols"}
                    </TextHeading>
                    <p className="text-sm text-muted-foreground/60 lowercase leading-relaxed">
                        {L.subtitle || "define and structure automated lineage error responses."}
                    </p>
                </div>
            </div>

            {/* Templates Grid Container */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 z-30 flex items-center justify-center rounded-[2.5rem] backdrop-blur-[1px]">
                        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {STATUS_CODES.map((status, idx) => {
                        const existing = getTemplateForCode(status.code);
                        const isEditing = editingId === existing?.id;

                        return (
                            <Card key={status.code} className="rounded-3xl border-2 border-foreground/5 bg-card shadow-none overflow-hidden animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 40}ms` }}>
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-row items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <Badge variant={getStatusColor(status.code) as any} className="size-12 rounded-xl text-lg font-bold flex items-center justify-center border-none shadow-none font-mono">
                                                {status.code}
                                            </Badge>
                                            <div>
                                                <p className="text-xs font-bold text-foreground/80 lowercase tracking-tight">{status.label}</p>
                                                <p className="text-[10px] text-muted-foreground/30 lowercase mt-0.5">standard platform protocol</p>
                                            </div>
                                        </div>
                                        {existing && (
                                            <div className="flex flex-row items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => startEdit(existing)} className="size-9 p-0 rounded-xl hover:bg-muted/30">
                                                    <Icons.edit className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(existing.id)} className="size-9 p-0 rounded-xl hover:bg-red-500/5 text-red-500/40 hover:text-red-500">
                                                    <Icons.trash className="size-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-4 animate-in fade-in duration-300">
                                            <textarea
                                                value={editForm.template}
                                                onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                                rows={5}
                                                className="w-full p-5 border-2 border-border/10 rounded-2xl font-mono text-[11px] resize-none bg-muted/20 focus:bg-background focus:outline-none focus:border-foreground/20 transition-all text-foreground/70"
                                                placeholder={L.placeholders.templateJson}
                                            />
                                            <div className="flex flex-row gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="rounded-xl h-9 px-6 lowercase text-xs">
                                                    {L.buttons.cancel}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleSave(editForm.statusCode, editForm.template)} className="rounded-xl h-9 px-8 lowercase text-xs shadow-none">
                                                    {L.buttons.save}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : existing ? (
                                        <div className="group relative">
                                            <pre className="p-5 bg-foreground rounded-2xl text-[10px] font-mono text-emerald-400 overflow-x-auto scrollbar-none leading-relaxed border-none shadow-inner">
                                                {existing.template}
                                            </pre>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(existing.template);
                                                }}
                                                className="absolute top-3 right-3 size-8 flex items-center justify-center bg-background/10 rounded-lg text-background opacity-0 group-hover:opacity-100 transition-all hover:bg-background/20"
                                            >
                                                <Icons.copy className="size-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-10 border-2 border-dashed border-border/10 rounded-[2rem] text-center bg-muted/5 group hover:border-foreground/5 transition-all">
                                            <Icons.tip className="size-10 text-muted-foreground/10 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                            <p className="text-[11px] text-muted-foreground/30 lowercase mb-6 leading-relaxed italic">{L.labels.noCustomTemplate || "no custom override detected for this protocol code."}</p>
                                            <Button variant="outline" size="sm" onClick={() => startNew(status.code, status.label)} className="rounded-xl h-9 px-6 lowercase text-xs border-2 hover:bg-muted/10 transition-all">
                                                {L.buttons.addTemplate || "initialize override"}
                                            </Button>
                                        </div>
                                    )}

                                    {editingId === String(-status.code) && (
                                        <div className="space-y-4 mt-6 animate-in slide-in-from-top-2 duration-300">
                                            <textarea
                                                value={editForm.template}
                                                onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                                rows={5}
                                                className="w-full p-5 border-2 border-border/10 rounded-2xl font-mono text-[11px] resize-none bg-muted/20 focus:bg-background focus:outline-none focus:border-foreground/20 transition-all text-foreground/70"
                                                placeholder={L.placeholders.templateJson}
                                            />
                                            <div className="flex flex-row gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="rounded-xl h-9 px-6 lowercase text-xs">
                                                    {L.buttons.cancel}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleSave(status.code, editForm.template)} className="rounded-xl h-9 px-8 lowercase text-xs shadow-none">
                                                    {L.buttons.create || "create protocol"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Custom Status Code Section */}
            <div className="pt-8">
                <Card className="rounded-[2.5rem] border-2 border-foreground/5 bg-foreground text-background shadow-none overflow-hidden relative group">
                    <CardContent className="p-10 sm:p-12 relative z-10">
                        <div className="flex flex-row gap-6 items-center mb-10">
                            <div className="size-14 rounded-2xl bg-background/10 flex items-center justify-center border-2 border-background/5">
                                <Icons.plus className="size-7 text-background" />
                            </div>
                            <div>
                                <TextHeading size="h4" className="text-background lowercase tracking-tight mb-1">{L.labels.addCustomStatusCode || "append custom protocol"}</TextHeading>
                                <p className="text-[10px] text-background/30 lowercase font-medium tracking-widest">manual injection of status logic</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="w-full sm:w-32 space-y-3">
                                <label className="text-[10px] font-bold text-background/30 uppercase tracking-[0.2em] px-1">code</label>
                                <Input
                                    type="number"
                                    placeholder="5XX"
                                    className="h-14 bg-background/5 border-2 border-background/10 text-background rounded-2xl font-bold font-mono focus:bg-background/10 focus:ring-0 focus:outline-none"
                                    value={editForm.statusCode > 500 ? editForm.statusCode : ''}
                                    onChange={(e) => setEditForm({ ...editForm, statusCode: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex-1 w-full space-y-3">
                                <label className="text-[10px] font-bold text-background/30 uppercase tracking-[0.2em] px-1">protocol schema template</label>
                                <Input
                                    placeholder='{ "status": "error", "message": "line error" }'
                                    className="h-14 bg-background/5 border-2 border-background/10 text-background rounded-2xl font-mono text-xs focus:bg-background/10 focus:ring-0 focus:outline-none"
                                    value={editForm.statusCode > 500 ? editForm.template : ''}
                                    onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                />
                            </div>
                            <Button variant="secondary" onClick={saveCustomCode} disabled={!editForm.statusCode || editForm.statusCode <= 500} className="h-14 px-10 rounded-2xl lowercase text-sm font-bold bg-background text-foreground hover:bg-background/90 shadow-none border-none active:scale-95 transition-all">
                                {L.buttons.add || "inject code"}
                            </Button>
                        </div>
                    </CardContent>
                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 size-60 rounded-full bg-background/[0.03] group-hover:scale-150 transition-transform duration-1000 pointer-events-none" />
                </Card>
            </div>
        </div>
    );
};
