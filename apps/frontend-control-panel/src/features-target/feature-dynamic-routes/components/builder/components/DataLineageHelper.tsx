'use client';

import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { useDataSourceColumns } from '../composables/useDataSourceColumns';
import { cn } from '@/lib/utils';

const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

interface DataLineageHelperProps {
  targetId: string;
  dataSourceId?: string;
  onInsert: (variable: string) => void;
}

export const DataLineageHelper = ({ targetId, dataSourceId, onInsert }: DataLineageHelperProps) => {
  const { columns, relations, loading } = useDataSourceColumns(targetId, dataSourceId);

  const standardVars = [
    { name: '{{DATA}}', desc: 'Full Result Array' },
    { name: '{{COUNT}}', desc: 'Total Records' },
    { name: '{{USER_ID}}', desc: 'Current User ID' },
    { name: '{{USER_ROLE}}', desc: 'Current User Role' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-none pb-10">
      {/* Standard Variables */}
      <div>
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icons.zap className="size-5 text-primary" />
          </div>
          <p className="text-base font-normal text-muted-foreground lowercase">
            {L.misc?.standardVars || 'standard variables'}
          </p>
        </div>
        <div className="space-y-3">
          {standardVars.map((v) => (
            <div
              key={v.name}
              className="group cursor-pointer rounded-2xl border-none bg-muted/40 hover:bg-muted/60 transition-all px-5 py-4 flex flex-col gap-0.5"
              onClick={() => onInsert(v.name)}
            >
              <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                {v.name}
              </span>
              <p className="text-base text-muted-foreground lowercase font-normal">
                {v.desc.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema (Columns) */}
      <div>
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icons.database className="size-5 text-primary" />
          </div>
          <p className="text-base font-normal text-muted-foreground lowercase">
            {L.misc?.dataColumns || 'database schema'}
          </p>
        </div>

        {!dataSourceId ? (
          <div className="p-8 rounded-2xl text-center bg-muted/40 border-none">
            <p className="text-base text-muted-foreground lowercase italic font-normal">
              {L.misc?.selectDataSourceHint || 'select a data source to view available lineage keys.'}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3 px-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <div className="p-8 rounded-2xl text-center bg-muted/40 border-none">
            <p className="text-base text-muted-foreground lowercase italic font-normal">
              {L.misc?.noColumnsFound || 'no keys discovered in this logic lineage.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {columns.map((col) => (
              <div
                key={col.name}
                className="group cursor-pointer rounded-2xl border-none bg-muted/40 hover:bg-muted/60 transition-all px-5 py-4 flex flex-row items-center justify-between gap-4"
                onClick={() => onInsert(`{{item.${col.name}}}`)}
              >
                <span className="text-base font-normal text-foreground group-hover:text-primary transition-colors truncate">
                  {col.name}
                </span>
                <span className="text-base px-3 py-1 bg-background text-muted-foreground group-hover:text-foreground rounded-xl transition-all lowercase italic">
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Relations (Nested Writes) */}
      <div>
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icons.link className="size-5 text-primary" />
          </div>
          <p className="text-base font-normal text-muted-foreground lowercase">
            {'relations (nested write support)'}
          </p>
        </div>

        {!dataSourceId ? (
          <div className="p-8 rounded-2xl text-center bg-muted/40 border-none">
            <p className="text-base text-muted-foreground lowercase italic font-normal">
              {'select a source to view relations'}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3 px-1">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !relations || relations.length === 0 ? (
          <div className="p-8 rounded-2xl text-center bg-muted/40 border-none">
            <p className="text-base text-muted-foreground lowercase italic font-normal">
              {'no relations found for this lineage'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {relations.map((rel: any) => {
              const alias = rel.alias || rel.target?.tableName;
              const isHasMany = (rel.type || '').toLowerCase() === 'has_many';
              return (
                <div
                  key={rel.id}
                  className="group cursor-pointer rounded-2xl border-none bg-muted/40 hover:bg-muted/60 transition-all px-5 py-4 flex flex-col gap-0.5"
                  onClick={() => onInsert(`"${alias}": ${isHasMany ? '[\n  { }\n]' : '{ }'}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {alias}
                    </span>
                    <Badge variant="secondary" className="text-[11px] px-1.5 py-0 h-5 lowercase">
                      {rel.type}
                    </Badge>
                  </div>
                  <p className="text-base text-muted-foreground lowercase font-normal truncate">
                    target: {rel.target?.name || rel.target?.tableName}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-auto p-6 rounded-3xl bg-primary/5 border-none group hover:bg-primary/10 transition-all">
        <p className="text-base leading-relaxed text-muted-foreground lowercase font-normal">
          <span className="text-primary font-semibold block mb-2">
            {L.misc?.lineageTip || 'pro tip'}
          </span>
          {L.misc?.lineageTipText || 'to loop through record sets, use the array key'}
          <span className="mx-2 font-semibold text-primary">
            {L.misc?.lineageTipCode || '{{DATA}}'}
          </span>
          {L.misc?.lineageTipSuffix || 'within your json schema structure.'}
        </p>
      </div>
    </div>
  );
};

// Simple Badge replacement if not imported
const Badge = ({ children, variant, className }: any) => (
  <span className={cn(
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    className
  )}>
    {children}
  </span>
);
