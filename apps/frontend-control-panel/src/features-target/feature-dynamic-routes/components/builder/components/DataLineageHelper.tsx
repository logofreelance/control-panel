'use client';

import { Icons } from '../../../config/icons';
import { DYNAMIC_ROUTES_LABELS } from '../../../constants/ui-labels';
import { Card, Heading, Text, Stack } from '@/components/ui';
import { useDataSourceColumns } from '../composables/useDataSourceColumns';

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
    <div className="p-4 flex flex-col gap-6 h-full overflow-y-auto rounded-xl">
      <div>
        <Heading level={5} className="text-sm! uppercase mb-3">
          <Stack direction="row" align="center" gap={2}>
            <Icons.zap className="w-3 h-3 text-amber-500" />
            {L.misc?.standardVars}
          </Stack>
        </Heading>
        <div className="space-y-1">
          {standardVars.map((v) => (
            <Card
              key={v.name}
              
              className="cursor-pointer"
              onClick={() => onInsert(v.name)}
            >
              <code className="text-xs font-semibold text-foreground block">{v.name}</code>
              <Text variant="muted" className="group-hover:text-foreground">
                {v.desc}
              </Text>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Heading level={5} className="text-sm! uppercase mb-3">
          <Stack direction="row" align="center" gap={2}>
            <Icons.database className="w-3 h-3 text-blue-500" />
            {L.misc?.dataColumns}
          </Stack>
        </Heading>

        {!dataSourceId ? (
          <Text variant="muted" className="italic">
            {L.misc?.selectDataSourceHint}
          </Text>
        ) : loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : columns.length === 0 ? (
          <Text variant="muted" className="italic">
            {L.misc?.noColumnsFound}
          </Text>
        ) : (
          <div className="space-y-1">
            {columns.map((col) => (
              <Card
                key={col.name}
                
                className="cursor-pointer"
                onClick={() => onInsert(`{{item.${col.name}}}`)}
              >
                <Stack direction="row" align="center" justify="between">
                  <code className="text-xs text-foreground font-medium truncate">{col.name}</code>
                  <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                    {col.type}
                  </span>
                </Stack>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-3 rounded-lg border border-border bg-muted/30">
        <Text variant="muted" className="leading-relaxed">
          <strong>{L.misc?.lineageTip}</strong> {L.misc?.lineageTipText}{' '}
          <code>{L.misc?.lineageTipCode}</code> {L.misc?.lineageTipSuffix}
        </Text>
      </div>
    </div>
  );
};
