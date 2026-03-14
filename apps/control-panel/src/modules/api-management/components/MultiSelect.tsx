import { Badge, Select } from '@cp/ui';
import { Icons, MODULE_LABELS } from '@cp/config/client';

interface MultiSelectProps {
    label: string;
    options: string[];
    value: string; // Comma separated
    onChange: (val: string) => void;
    placeholder?: string;
}

export const MultiSelect = ({ label, options, value, onChange, placeholder }: MultiSelectProps) => {
    const L = MODULE_LABELS.apiManagement;
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
            <label className="block text-sm font-bold text-slate-700">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                {selected.map(item => (
                    <Badge key={item} variant="primary" className="pl-3 pr-1 py-1 flex items-center gap-1">
                        {item}
                        <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center font-bold text-xs"
                        >
                            <Icons.close className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
                {selected.length === 0 && <span className="text-sm text-slate-400 italic">{L.misc?.noneSelected}</span>}
            </div>
            <Select
                value=""
                onChange={(e) => handleAdd(e.target.value)}
                options={[
                    { label: placeholder || L.misc?.selectToAdd || '', value: '' },
                    ...options.filter(o => !selected.includes(o)).map(o => ({ label: o, value: o }))
                ]}
            />
        </div>
    );
};

