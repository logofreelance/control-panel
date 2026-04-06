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
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-row items-center gap-4 px-1">
                <div className="size-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                    <Icons.error className="size-6" />
                </div>
                <div>
                    <TextHeading size="h3" weight="semibold" className="text-2xl sm:text-3xl lowercase">
                        {L.title || "error protocols"}
                    </TextHeading>
                    <p className="text-lg text-muted-foreground lowercase leading-relaxed">
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
                            <Card key={status.code} className="bg-card overflow-hidden animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 40}ms` }}>
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-row items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("size-12 rounded-lg text-xl font-bold flex items-center justify-center", getStatusColor(status.code) === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary')}>
                                                {status.code}
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-foreground lowercase">{status.label}</p>
                                                <p className="text-sm text-muted-foreground lowercase mt-0.5">standard platform protocol</p>
                                            </div>
                                        </div>
                                        {existing && (
                                            <div className="flex flex-row items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => startEdit(existing)} className="size-9 p-0 rounded-lg">
                                                    <Icons.edit className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(existing.id)} className="size-9 p-0 rounded-lg text-rose-500">
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
                                                className="w-full p-4 border-none rounded-xl font-sans text-base resize-none bg-muted focus:bg-muted/80 focus:outline-none transition-all text-foreground"
                                                placeholder={L.placeholders.templateJson}
                                            />
                                            <div className="flex flex-row gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="lowercase">
                                                    {L.buttons.cancel}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleSave(editForm.statusCode, editForm.template)} className="lowercase shadow-none">
                                                    {L.buttons.save}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : existing ? (
                                        <div className="group relative">
                                            <div className="p-5 bg-foreground text-background rounded-xl text-base font-sans whitespace-pre overflow-x-auto scrollbar-none leading-relaxed">
                                                {existing.template}
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(existing.template);
                                                }}
                                                className="absolute top-3 right-3 size-8 flex items-center justify-center bg-background/20 rounded-lg text-background opacity-0 group-hover:opacity-100 transition-all hover:bg-background/30"
                                            >
                                                <Icons.copy className="size-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-8 border-none rounded-xl text-center bg-muted/20 group transition-all">
                                            <Icons.tip className="size-10 text-muted-foreground mx-auto mb-4 opacity-40 group-hover:scale-105 transition-transform" />
                                            <p className="text-sm text-muted-foreground lowercase mb-6 leading-relaxed italic">{L.labels.noCustomTemplate || "no custom override detected for this protocol code."}</p>
                                            <Button variant="outline" size="sm" onClick={() => startNew(status.code, status.label)} className="lowercase">
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
                                                className="w-full p-4 border-none rounded-xl font-sans text-base resize-none bg-muted focus:bg-muted/80 focus:outline-none transition-all text-foreground"
                                                placeholder={L.placeholders.templateJson}
                                            />
                                            <div className="flex flex-row gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={cancelEdit} className="lowercase">
                                                    {L.buttons.cancel}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleSave(status.code, editForm.template)} className="lowercase shadow-none">
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
            <div className="pt-4">
                <Card className="bg-foreground text-background overflow-hidden relative group">
                    <CardContent className="p-6 sm:p-8 relative z-10">
                        <div className="flex flex-row gap-6 items-center mb-10">
                            <div className="size-14 rounded-xl bg-background/10 flex items-center justify-center">
                                <Icons.plus className="size-7 text-background" />
                            </div>
                            <div>
                                <TextHeading size="h4" className="text-background lowercase mb-1">{L.labels.addCustomStatusCode || "append custom protocol"}</TextHeading>
                                <p className="text-base text-background lowercase">manual injection of status logic</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="w-full sm:w-32 space-y-3">
                                <label className="text-sm font-medium text-background lowercase px-1">code</label>
                                <Input
                                    type="number"
                                    placeholder="5xx"
                                    className="h-12 bg-background/10 border-none text-background rounded-xl font-bold font-sans focus:bg-background/20 focus:ring-0 focus:outline-none placeholder:text-background/40"
                                    value={editForm.statusCode > 500 ? editForm.statusCode : ''}
                                    onChange={(e) => setEditForm({ ...editForm, statusCode: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex-1 w-full space-y-3">
                                <label className="text-sm font-medium text-background lowercase px-1">protocol schema template</label>
                                <Input
                                    placeholder='{ "status": "error", "message": "line error" }'
                                    className="h-12 bg-background/10 border-none text-background rounded-xl font-sans text-base focus:bg-background/20 focus:ring-0 focus:outline-none placeholder:text-background/40"
                                    value={editForm.statusCode > 500 ? editForm.template : ''}
                                    onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                />
                            </div>
                            <Button variant="secondary" size="lg" onClick={saveCustomCode} disabled={!editForm.statusCode || editForm.statusCode <= 500} className="lowercase font-bold bg-background text-foreground hover:bg-background/90 shadow-none border-none active:scale-95 transition-all">
                                {L.buttons.add || "inject code"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
