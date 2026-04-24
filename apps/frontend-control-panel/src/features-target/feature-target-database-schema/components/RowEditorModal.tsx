'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Field,
  FieldLabel,
  Checkbox,
  Label,
} from '@/components/ui';
import { Icons } from '@/lib/config/client';

interface RowEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: any[];
  rowData?: Record<string, any> | null;
  onSave: (data: Record<string, any>) => Promise<boolean>;
}

export const RowEditorModal = ({
  isOpen,
  onClose,
  columns,
  rowData,
  onSave,
}: RowEditorModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (rowData) {
        setFormData({ ...rowData });
      } else {
        // Initialize with defaults if any
        const defaults: Record<string, any> = {};
        columns.forEach((col) => {
          if (col.name !== 'id' && col.default !== undefined) {
             // Handle some special defaults if needed
             if (col.default !== 'CURRENT_TIMESTAMP') {
                defaults[col.name] = col.default;
             }
          }
        });
        setFormData(defaults);
      }
    }
  }, [isOpen, rowData, columns]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);
    if (success) onClose();
  };

  // Filter out system columns like id if it's auto-increment, 
  // or created_at/updated_at if they are managed by DB
  const editableColumns = columns.filter(col => {
    const name = (col.name || "").toLowerCase();
    return name !== 'id' && name !== 'created_at' && name !== 'updated_at';
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="lowercase font-semibold text-xl flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Icons.edit className="size-4" />
            </div>
            {rowData ? 'edit record' : 'add new record'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableColumns.map((col) => {
              const name = col.name;
              const type = (col.type || "").toLowerCase();
              const label = col.displayName || name;

              if (type === 'boolean' || type === 'bool' || type === 'tinyint(1)') {
                return (
                  <div key={name} className="flex items-center gap-3 pt-8">
                    <Checkbox
                      id={`field-${name}`}
                      checked={!!formData[name]}
                      onCheckedChange={(val) => handleChange(name, val)}
                    />
                    <Label htmlFor={`field-${name}`} className="lowercase font-normal text-base">
                      {label}
                    </Label>
                  </div>
                );
              }

              return (
                <div key={name} className="space-y-2">
                  <Input
                    label={label.toLowerCase()}
                    type={type.includes('int') || type.includes('decimal') ? 'number' : 'text'}
                    value={formData[name] === null || formData[name] === undefined ? '' : String(formData[name])}
                    onChange={(e) => handleChange(name, e.target.value)}
                    placeholder={`Enter ${label}...`}
                    required={col.required}
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter className="pt-6 border-t border-border/10">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              <Icons.save className="size-4 mr-2" />
              {rowData ? 'update record' : 'save record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
