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
    <div className="flex flex-col gap-10 h-full overflow-y-auto scrollbar-none pb-10">
      <div>
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="p-2 rounded-xl bg-amber-500/10 border-2 border-amber-500/5">
            <Icons.zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{L.misc?.standardVars || 'standard variables'}</p>
        </div>
        <div className="space-y-2">
          {standardVars.map((v) => (
            <Card
              key={v.name}
              className="group cursor-pointer rounded-2xl border-2 border-transparent hover:border-foreground/5 hover:bg-muted/10 transition-all shadow-none overflow-hidden"
              onClick={() => onInsert(v.name)}
            >
                <div className="p-4 flex flex-col gap-1">
                    <code className="text-xs font-bold text-foreground/80 group-hover:text-amber-600 transition-colors">{v.name}</code>
                    <p className="text-[10px] text-muted-foreground/30 lowercase group-hover:text-muted-foreground/60 transition-colors">
                        {v.desc}
                    </p>
                </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="p-2 rounded-xl bg-blue-500/10 border-2 border-blue-500/5">
            <Icons.database className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{L.misc?.dataColumns || 'database schema'}</p>
        </div>

        {!dataSourceId ? (
          <div className="p-10 border-2 border-dashed border-border/10 rounded-[2rem] text-center bg-muted/5 opacity-50">
            <p className="text-[10px] text-muted-foreground/30 lowercase italic tracking-tight">
                {L.misc?.selectDataSourceHint || "select a data source to view available lineage keys."}
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <div className="p-10 border-2 border-dashed border-border/10 rounded-[2rem] text-center bg-muted/5 opacity-50">
            <p className="text-[10px] text-muted-foreground/30 lowercase italic tracking-tight">
                {L.misc?.noColumnsFound || "no keys discovered in this logic lineage."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {columns.map((col) => (
              <Card
                key={col.name}
                className="group cursor-pointer rounded-2xl border-2 border-transparent hover:border-foreground/5 hover:bg-muted/10 transition-all shadow-none overflow-hidden"
                onClick={() => onInsert(`{{item.${col.name}}}`)}
              >
                <div className="p-4 flex flex-row items-center justify-between gap-4">
                  <code className="text-xs font-bold text-foreground/80 group-hover:text-blue-600 transition-colors truncate">{col.name}</code>
                  <span className="text-[9px] px-2 py-0.5 bg-muted/50 text-muted-foreground/40 group-hover:text-foreground/40 rounded-lg font-mono tracking-tighter transition-all">
                    {col.type}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-6 rounded-[2rem] border-2 border-foreground/5 bg-muted/5 group hover:border-foreground/10 transition-all">
        <p className="text-[10px] leading-relaxed text-muted-foreground/40 lowercase font-medium">
          <strong className="text-foreground/40 font-bold block mb-2">{L.misc?.lineageTip || "PRO TIP"}</strong> 
          {L.misc?.lineageTipText || "to loop through record sets, use the array key"}
          <code className="mx-1.5 px-2 py-0.5 bg-background rounded-lg text-primary font-bold">{L.misc?.lineageTipCode || "{{DATA}}"}</code> 
          {L.misc?.lineageTipSuffix || "within your json schema structure."}
        </p>
      </div>
    </div>
  );
};
