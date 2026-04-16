import * as React from 'react';
import { cn } from '@/lib/utils';
import { TextHeading } from './text-heading';

interface PageTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: React.ReactNode;
}

/**
 * PageTitle - Standardized Page Header Component
 *
 * Consistent with MonitorDatabaseView style:
 * - Title: Medium weight, large scale, lowercase
 * - Subtitle: Normal weight, lg scale, muted, lowercase
 *
 * Usage:
 * <PageTitle title="database" subtitle="manage system storage" />
 */
export const PageTitle = React.forwardRef<HTMLDivElement, PageTitleProps>(
  ({ title, subtitle, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
        <TextHeading as="h1" size="h3" className="lowercase leading-none tracking-normal">
          {title}
        </TextHeading>
        {subtitle && (
          <p className="text-lg text-muted-foreground font-normal lowercase opacity-60 leading-tight tracking-normal">
            {subtitle}
          </p>
        )}
      </div>
    );
  },
);

PageTitle.displayName = 'PageTitle';
