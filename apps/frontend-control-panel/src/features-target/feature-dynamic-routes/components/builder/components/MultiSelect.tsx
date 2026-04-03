import { Badge, Select, Text } from '@/components/ui';
import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';

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
 <label className="block text-sm font-semibold text-foreground">{label}</label>
 <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
 {selected.map(item => (
 <Badge key={item} variant="default" className="pl-3 pr-1 py-1 flex items-center gap-1">
 {item}
 <button
 type="button"
 onClick={() => handleRemove(item)}
 className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center font-semibold text-xs"
 >
 <Icons.close className="w-3 h-3" />
 </button>
 </Badge>
 ))}
 {selected.length === 0 && <Text variant="muted" className="italic">{L.misc?.noneSelected}</Text>}
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
