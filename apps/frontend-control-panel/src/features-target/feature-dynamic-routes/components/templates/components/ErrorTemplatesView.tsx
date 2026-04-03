'use client';

import { Button, Badge, Input, Card, CardContent, Heading, Text, Stack } from '@/components/ui';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';
import { useErrorTemplates, STATUS_CODES } from '../composables';
import { PageLoadingSkeleton } from '@/modules/_core';

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
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <div>
                <Heading level={3}>{L.title}</Heading>
                <Text variant="muted">{L.subtitle}</Text>
            </div>

            {/* Templates Grid */}
            <div className="relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-background z-10 flex items-center justify-center rounded-3xl">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STATUS_CODES.map(status => {
                        const existing = getTemplateForCode(status.code);
                        const isEditing = editingId === existing?.id;

                        return (
                            <Card key={status.code} >
                                <CardContent className="p-4">
                                    <Stack direction="row" justify="between" align="start" className="mb-3">
                                        <Stack direction="row" gap={2} align="center">
                                            <Badge variant={getStatusColor(status.code)} className="text-lg font-mono">
                                                {status.code}
                                            </Badge>
                                            <Text className="font-medium">{status.label}</Text>
                                        </Stack>
                                        {existing && (
                                            <Stack direction="row" gap={1}>
                                                <Button variant="ghost" size="icon-sm" onClick={() => startEdit(existing)}>
                                                    <Icons.edit className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(existing.id)}>
                                                    <Icons.trash className="size-4 text-destructive" />
                                                </Button>
                                            </Stack>
                                        )}
                                    </Stack>

                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editForm.template}
                                                onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                                rows={4}
                                                className="w-full p-2 border border-border rounded-xl font-mono text-sm resize-none bg-background focus:outline-none focus:border-foreground/30"
                                                placeholder={L.placeholders.templateJson}
                                            />
                                            <Stack direction="row" gap={2} justify="end">
                                                <Button variant="outline" size="sm" onClick={cancelEdit}>
                                                    {L.buttons.cancel}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleSave(editForm.statusCode, editForm.template)}>
                                                    {L.buttons.save}
                                                </Button>
                                            </Stack>
                                        </div>
                                    ) : existing ? (
                                        <pre className="p-3 bg-muted rounded-xl text-xs font-mono text-foreground overflow-x-auto">
                                            {existing.template}
                                        </pre>
                                    ) : (
                                        <div className="p-4 border-2 border-dashed border-border rounded-xl text-center">
                                            <Text variant="muted" className="text-sm mb-2">{L.labels.noCustomTemplate}</Text>
                                            <Button variant="outline" size="sm" onClick={() => startNew(status.code, status.label)}>
                                                {L.buttons.addTemplate}
                                            </Button>
                                        </div>
                                    )}

                                    {editingId === String(-status.code) && (
                                        <div className="space-y-2 mt-2">
                                            <textarea
                                                value={editForm.template}
                                                onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                                rows={4}
                                                className="w-full p-2 border border-border rounded-xl font-mono text-sm resize-none bg-background focus:outline-none focus:border-foreground/30"
                                            />
                                            <Stack direction="row" gap={2} justify="end">
                                                <Button variant="outline" size="sm" onClick={cancelEdit}>
                                                    {L.buttons.cancel}
                                                </Button>
                                                <Button variant="default" size="sm" onClick={() => handleSave(status.code, editForm.template)}>
                                                    {L.buttons.create}
                                                </Button>
                                            </Stack>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Custom Status Code */}
            <div className="relative min-h-[120px]">
                {loading && (
                    <div className="absolute inset-0 bg-background z-10 flex items-center justify-center rounded-3xl">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <Card >
                    <CardContent className="p-4">
                        <Text className="font-medium mb-3">{L.labels.addCustomStatusCode}</Text>
                        <Stack direction="row" gap={3}>
                            <Input
                                type="number"
                                placeholder={L.placeholders.statusCode}
                                className="w-32"
                                value={editForm.statusCode > 500 ? editForm.statusCode : ''}
                                onChange={(e) => setEditForm({ ...editForm, statusCode: parseInt(e.target.value) || 0 })}
                            />
                            <Input
                                placeholder={L.placeholders.customTemplate}
                                className="flex-1 font-mono text-sm"
                                value={editForm.statusCode > 500 ? editForm.template : ''}
                                onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                            />
                            <Button variant="default" onClick={saveCustomCode} disabled={!editForm.statusCode || editForm.statusCode <= 500}>
                                {L.buttons.add}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
