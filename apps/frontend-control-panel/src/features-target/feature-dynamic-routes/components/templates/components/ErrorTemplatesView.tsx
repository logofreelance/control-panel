'use client';

import { 
  Button, 
  Badge, 
  Input, 
  Card, 
  CardContent, 
  Label,
  Textarea
} from '@/components/ui';
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
    <div className="space-y-4 animate-page-enter">
      {/* Header - No Icon */}
      <div className="px-1">
        <TextHeading size="h3" className="lowercase">
          {L.title || 'error protocols'}
        </TextHeading>
        <p className="text-base text-muted-foreground lowercase mt-1">
          {L.subtitle || 'define and structure automated lineage error responses.'}
        </p>
      </div>

      {/* Grid Container */}
      <div className="relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 z-30 flex items-center justify-center backdrop-blur-[1px]">
            <Icons.loading className="size-8 animate-spin text-primary" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STATUS_CODES.map((status, idx) => {
            const existing = getTemplateForCode(status.code);
            const isEditing = editingId === existing?.id;

            return (
              <Card key={status.code}>
                <CardContent>
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-4 mt-6">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={getStatusColor(status.code) === 'danger' ? 'destructive' : 'secondary'}
                        className="text-base"
                      >
                        {status.code}
                      </Badge>
                      <div>
                        <TextHeading as="h3" size="h4" className="lowercase leading-none">
                          {status.label}
                        </TextHeading>
                        <p className="text-base font-normal text-muted-foreground lowercase mt-1">
                          platform protocol
                        </p>
                      </div>
                    </div>
                    {existing && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => startEdit(existing)}>
                          <Icons.edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(existing.id)}
                          className="text-destructive"
                        >
                          <Icons.trash className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 animate-in fade-in">
                      <Textarea
                        value={editForm.template}
                        onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                        rows={4}
                        className="lowercase h-24"
                        placeholder={L.placeholders.templateJson}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEdit} className="lowercase">
                          {L.buttons.cancel}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(editForm.statusCode, editForm.template)}
                          className="lowercase"
                        >
                          {L.buttons.save}
                        </Button>
                      </div>
                    </div>
                  ) : existing ? (
                    <div className="group relative">
                      <div className="p-3 bg-muted/20 rounded-lg text-base font-normal lowercase whitespace-pre overflow-x-auto border border-border/5">
                        {existing.template}
                      </div>
                      <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => navigator.clipboard.writeText(existing.template)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      >
                        <Icons.copy className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-border/20 bg-muted/5 text-center rounded-lg">
                      <p className="text-base font-normal text-muted-foreground lowercase mb-3 italic">
                        {L.labels.noCustomTemplate || 'no custom override detected.'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => startNew(status.code, status.label)} className="lowercase">
                        {L.buttons.addTemplate || 'initialize override'}
                      </Button>
                    </div>
                  )}

                  {editingId === String(-status.code) && (
                    <div className="space-y-3 mt-3 animate-in slide-in-from-top-2">
                      <Textarea
                        value={editForm.template}
                        onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                        rows={4}
                        className="lowercase h-24"
                        placeholder={L.placeholders.templateJson}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEdit} className="lowercase">
                          {L.buttons.cancel}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(status.code, editForm.template)}
                          className="lowercase"
                        >
                          {L.buttons.create || 'create protocol'}
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

      {/* Add Custom Code Section - No Icon */}
      <Card>
        <CardContent>
          <div className="mb-4 mt-6">
            <TextHeading as="h3" size="h4" className="lowercase">
              {L.labels.addCustomStatusCode || 'append custom protocol'}
            </TextHeading>
            <p className="text-base text-muted-foreground lowercase mt-1">
              manual injection of status logic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-2 space-y-1">
              <Label className="lowercase ml-1">code</Label>
              <Input
                type="number"
                placeholder="5xx"
                value={editForm.statusCode > 500 ? editForm.statusCode : ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, statusCode: parseInt(e.target.value) || 0 })
                }
                className="lowercase h-9"
              />
            </div>
            <div className="md:col-span-8 space-y-1">
              <Label className="lowercase ml-1">template schema</Label>
              <Input
                placeholder='{ "status": "error", "message": "error info" }'
                value={editForm.statusCode > 500 ? editForm.template : ''}
                onChange={(e) => setEditForm({ ...editForm, template: e.target.value })}
                className="lowercase h-9"
              />
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={saveCustomCode}
                disabled={!editForm.statusCode || editForm.statusCode <= 500}
                className="w-full lowercase h-9"
              >
                {L.buttons.add || 'inject'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
