'use client';

import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { Card, CardContent } from '@/components/ui';
import { useDataSourceColumns } from '../composables/useDataSourceColumns';
import { cn } from '@/lib/utils';

const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

interface DataLineageHelperProps {
  targetId: string;
  dataSourceId?: string;
  onInsert: (variable: string) => void;
}

export const DataLineageHelper = ({ targetId, dataSourceId, onInsert }: DataLineageHelperProps) => {
  const { columns, loading } = useDataSourceColumns(targetId, dataSourceId);

  const standardVars = [
    { name: '{{DATA}}', desc: 'Full Result Array' },
    { name: '{{COUNT}}', desc: 'Total Records' },
    { name: '{{USER_ID}}', desc: 'Current User ID' },
    { name: '{{USER_ROLE}}', desc: 'Current User Role' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto scrollbar-none pb-10">
      <div>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="size-8 rounded-lg bg-amber-500/5 flex items-center justify-center shrink-0">
            <Icons.zap className="size-4 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground lowercase">{L.misc?.standardVars || 'standard variables'}</p>
        </div>
        <div className="space-y-1.5">
          {standardVars.map((v) => (
            <div
              key={v.name}
              className="group cursor-pointer rounded-xl border-none bg-muted/30 hover:bg-muted/50 transition-all px-4 py-3 flex flex-col gap-0.5"
              onClick={() => onInsert(v.name)}
            >
                <span className="text-base font-medium text-foreground group-hover:text-amber-600 transition-colors uppercase tracking-tight">{v.name}</span>
                <p className="text-sm text-muted-foreground lowercase">
                    {v.desc.toLowerCase()}
                </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="size-8 rounded-lg bg-blue-500/5 flex items-center justify-center shrink-0">
            <Icons.database className="size-4 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground lowercase">{L.misc?.dataColumns || 'database schema'}</p>
        </div>

        {!dataSourceId ? (
          <div className="p-6 rounded-xl text-center bg-muted/20 border-none">
            <p className="text-sm text-muted-foreground lowercase italic">
                {L.misc?.selectDataSourceHint || "select a data source to view available lineage keys."}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-1.5 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <div className="p-6 rounded-xl text-center bg-muted/20 border-none">
            <p className="text-sm text-muted-foreground lowercase italic">
                {L.misc?.noColumnsFound || "no keys discovered in this logic lineage."}
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {columns.map((col) => (
              <div
                key={col.name}
                className="group cursor-pointer rounded-xl border-none bg-muted/30 hover:bg-muted/50 transition-all px-4 py-3 flex flex-row items-center justify-between gap-4"
                onClick={() => onInsert(`{{item.${col.name}}}`)}
              >
                <span className="text-base font-medium text-foreground group-hover:text-blue-600 transition-colors truncate">{col.name}</span>
                <span className="text-sm px-2 py-0.5 bg-background text-muted-foreground group-hover:text-foreground rounded-lg transition-all lowercase">
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-5 rounded-xl bg-primary/5 border-none group hover:bg-primary/8 transition-all">
        <p className="text-sm leading-relaxed text-muted-foreground lowercase">
          <span className="text-primary font-medium block mb-1">{L.misc?.lineageTip || "pro tip"}</span> 
          {L.misc?.lineageTipText || "to loop through record sets, use the array key"}
          <span className="mx-1.5 font-medium text-primary">{L.misc?.lineageTipCode || "{{DATA}}"}</span> 
          {L.misc?.lineageTipSuffix || "within your json schema structure."}
        </p>
      </div>
    </div>
  );
};
