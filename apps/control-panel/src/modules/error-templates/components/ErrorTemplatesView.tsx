'use client';

// ErrorTemplatesView - Global error template management
// Customize API error responses

import { Button, Badge, Input } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';
import { useErrorTemplates, STATUS_CODES } from '../composables';


const L = MODULE_LABELS.errorTemplates;

// Card component
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl ring-1 ring-slate-100 ${className}`}>{children}</div>
);

export const ErrorTemplatesView = () => {
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
    } = useErrorTemplates();

    const LoadingOverlay = () => (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center rounded-xl">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin shadow-sm" />
        </div>
    );

    return (
        <div className="space-y-6 animate-page-enter">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">{L.title}</h2>
                    <p className="text-sm text-slate-500">{L.subtitle}</p>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="relative min-h-[300px]">
                {loading && <LoadingOverlay />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STATUS_CODES.map(status => {
                        const existing = getTemplateForCode(status.code);
                        const isEditing = editingId === existing?.id;

                        return (
                            <Card key={status.code} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getStatusColor(status.code)} className="text-lg font-mono">
                                            {status.code}
                                        </Badge>
                                        <span className="font-medium text-slate-700">{status.label}</span>
                                    </div>
                                    {existing && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => startEdit(existing)}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                                            >
                                                <Icons.edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(existing.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                            >
                                                <Icons.trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editForm.template}
                                            onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                            rows={4}
                                            className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm resize-none"
                                            placeholder={L.placeholders.templateJson}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="slate" size="sm" onClick={cancelEdit}>
                                                {L.buttons.cancel}
                                            </Button>
                                            <Button size="sm" onClick={() => handleSave(editForm.statusCode, editForm.template)}>
                                                {L.buttons.save}
                                            </Button>
                                        </div>
                                    </div>
                                ) : existing ? (
                                    <pre className="p-2 bg-slate-50 rounded-lg text-xs font-mono text-slate-600 overflow-x-auto">
                                        {existing.template}
                                    </pre>
                                ) : (
                                    <div className="p-3 border-2 border-dashed border-slate-200 rounded-lg text-center">
                                        <p className="text-sm text-slate-400 mb-2">{L.labels.noCustomTemplate}</p>
                                        <Button
                                            size="sm"
                                            variant="slate"
                                            onClick={() => startNew(status.code, status.label)}
                                        >
                                            {L.buttons.addTemplate}
                                        </Button>
                                    </div>
                                )}

                                {/* New template form */}
                                {editingId === -status.code && (
                                    <div className="space-y-2 mt-2">
                                        <textarea
                                            value={editForm.template}
                                            onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                                            rows={4}
                                            className="w-full p-2 border border-slate-200 rounded-lg font-mono text-sm resize-none"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="slate" size="sm" onClick={cancelEdit}>
                                                {L.buttons.cancel}
                                            </Button>
                                            <Button size="sm" onClick={() => handleSave(status.code, editForm.template)}>
                                                {L.buttons.create}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Custom Status Code */}
            <div className="relative min-h-[120px]">
                {loading && <LoadingOverlay />}
                <Card className="p-4">
                    <h3 className="font-medium text-slate-700 mb-3">{L.labels.addCustomStatusCode}</h3>
                    <div className="flex gap-3">
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
                        <Button
                            onClick={saveCustomCode}
                            disabled={!editForm.statusCode || editForm.statusCode <= 500}
                        >
                            {L.buttons.add}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

