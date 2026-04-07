import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-md px-8 py-16 bg-background text-foreground border-border", className)} showCloseButton>
        {(title || description) && (
          <DialogHeader className="mb-8">
            {title && <DialogTitle className="text-xl sm:text-2xl font-bold lowercase tracking-tight">{title}</DialogTitle>}
            {description && <DialogDescription className="text-base text-muted-foreground lowercase leading-relaxed">{description}</DialogDescription>}
          </DialogHeader>
        )}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 max-h-[70vh]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
