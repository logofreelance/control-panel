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
        <div className="space-y-3">
            <label className="block text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-1">{label}</label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-2xl bg-muted/10 border-2 border-border/5">
                {selected.map(item => (
                    <Badge key={item} variant="default" className="pl-3 pr-1 py-1 flex items-center gap-1 rounded-xl bg-foreground text-background shadow-none border-none text-[10px] lowercase">
                        {item}
                        <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="w-5 h-5 rounded-lg hover:bg-background/20 flex items-center justify-center transition-colors"
                        >
                            <Icons.close className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
                {selected.length === 0 && (
                    <p className="text-[10px] text-muted-foreground/30 italic lowercase px-2 py-1.5">
                        {L.misc?.noneSelected || "no items selected"}
                    </p>
                )}
            </div>
            <Select
                value=""
                onChange={(e) => handleAdd(e.target.value)}
                options={[
                    { label: placeholder || L.misc?.selectToAdd || 'select an item...', value: '' },
                    ...options.filter(o => !selected.includes(o)).map(o => ({ label: o.toLowerCase(), value: o }))
                ]}
            />
        </div>
    );
};
