import { Badge, Select } from '@/components/ui';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { cn } from '@/lib/utils';

interface MultiSelectProps {
    label: string;
    options: string[];
    value: string; // Comma separated
    onChange: (val: string) => void;
    placeholder?: string;
}

export const MultiSelect = ({ label, options, value, onChange, placeholder }: MultiSelectProps) => {
    const L = DYNAMIC_ROUTES_LABELS.routeBuilder;
    const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    const handleAdd = (val: string) => {
        if (!val || selected.includes(val)) return;
        const newSelected = [...selected, val];
        onChange(newSelected.join(', '));
    };

    const handleRemove = (val: string) => {
        const newSelected = selected.filter(s => s !== val);
        onChange(newSelected.join(', '));
    };

    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-medium text-muted-foreground/60 lowercase px-1">{label}</label>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-muted/40 border-none items-center">
                {selected.map(item => (
                    <Badge key={item} variant="secondary" className="pl-3 pr-1.5 py-1.5 flex items-center gap-1.5 rounded-lg bg-background text-foreground shadow-none border-none text-xs lowercase font-medium">
                        {item}
                        <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="size-5 rounded-md hover:bg-muted flex items-center justify-center transition-colors shrink-0"
                        >
                            <Icons.close className="size-3 text-muted-foreground" />
                        </button>
                    </Badge>
                ))}
                {selected.length === 0 && (
                    <span className="text-xs text-muted-foreground/30 italic lowercase px-2">
                        {L.misc?.noneSelected || "none selected"}
                    </span>
                )}
            </div>
            <Select
                value=""
                onChange={(e) => handleAdd(e.target.value)}
                size="lg"
                className="w-full rounded-xl bg-muted border-none"
                options={[
                    { label: placeholder || L.misc?.selectToAdd || 'select to add...', value: '' },
                    ...options.filter(o => !selected.includes(o)).map(o => ({ label: o.toLowerCase(), value: o }))
                ]}
            />
        </div>
    );
};
