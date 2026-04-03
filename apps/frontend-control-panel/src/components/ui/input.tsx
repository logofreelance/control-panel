import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

import { Label } from '@/components/ui/label';

interface InputProps extends React.ComponentProps<'input'> {
  label?: string;
}

function Input({ className, type, label, id, ...props }: InputProps) {
  const inputId = id || React.useId();

  const inputEl = (
    <InputPrimitive
      id={inputId}
      type={type}
      data-slot="input"
      className={cn(
        'flex h-11 w-full rounded-xl border-2 border-border/70 bg-background/50 px-4 py-2 text-base transition-all duration-200 outline-none',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground/50 text-sm md:text-base',
        'hover:border-border hover:bg-background/80',
        'focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/5',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/10',
        'dark:bg-input/20 dark:hover:bg-input/40 dark:disabled:bg-input/60',
        className,
      )}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="grid gap-2 w-full">
        <div className="flex items-center px-1">
          <Label htmlFor={inputId} className="text-sm font-normal text-foreground/75">
            {label}
          </Label>
        </div>
        {inputEl}
      </div>
    );
  }

  return inputEl;
}

export { Input };
