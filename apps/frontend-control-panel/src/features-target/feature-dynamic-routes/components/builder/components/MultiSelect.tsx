import { Badge, Select, Label } from '@/components/ui';
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
  const selected = value
    ? value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleAdd = (val: string) => {
    if (!val || selected.includes(val)) return;
    const newSelected = [...selected, val];
    onChange(newSelected.join(', '));
  };

  const handleRemove = (val: string) => {
    const newSelected = selected.filter((s) => s !== val);
    onChange(newSelected.join(', '));
  };

  return (
    <div className="space-y-3">
      {label && (
        <Label className="block lowercase px-1">
          {label}
        </Label>
      )}
      <div className="flex flex-wrap gap-2 items-center p-3 min-h-[44px] rounded-xl border border-dashed border-border/20">
        {selected.map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className="lowercase"
          >
            {item}
            <button
              type="button"
              onClick={() => handleRemove(item)}
              className="ml-1 shrink-0 outline-none opacity-60 hover:opacity-100"
            >
              <Icons.close className="size-3" />
            </button>
          </Badge>
        ))}
        {selected.length === 0 && (
          <span className="text-base text-muted-foreground lowercase px-1">
            {placeholder || L.misc?.noneSelected || 'none selected'}
          </span>
        )}
      </div>
      <Select
        value=""
        onChange={(e) => handleAdd(e.target.value)}
        fullWidth
        options={[
          { label: L.misc?.selectToAdd || 'select items...', value: '' },
          ...options
            .filter((o) => !selected.includes(o))
            .map((o) => ({ label: o.toLowerCase(), value: o })),
        ]}
      />
    </div>
  );
};
