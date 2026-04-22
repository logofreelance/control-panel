'use client';

/**
 * DataPage - Flat Luxury UI Refactor
 * Full page component for viewing data source data integrated with TargetLayout
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { TargetLayout } from '@/components/layout/TargetLayout';
import { DataViewer } from '../components/DataViewer';
import { PageTitle } from '@/components/ui/page-title';
import { ConfirmDialog } from '@/modules/_core';
import { Icons } from '@/lib/config/client';
import { cn } from '@/lib/utils';
import { API } from '../api/endpoints';
import { FEATURE_LABELS as L } from '../constants';
import { API_STATUS } from '@/lib/config/defaults';
import { apiClient } from '@/lib/frontend-api';
import type { DatabaseTable } from '../types';

export function DataPage() {
  const params = useParams();
  const router = useRouter();

  // Resolve IDs from URL params
  const rawTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId;
  const rawNodeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const isTargetRoute = !!rawTableId;
  const nodeId = isTargetRoute ? rawNodeId : undefined;
  const tableId = rawTableId || rawNodeId;

  // State
  const [source, setSource] = useState<DatabaseTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data source details
  const fetchSource = async () => {
    if (!tableId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (nodeId) headers['x-target-id'] = nodeId;

      const res = await apiClient.get<DatabaseTable>(API.detail(tableId), { headers });

      if (res.status === API_STATUS.SUCCESS && res.data) {
        setSource(res.data);
        setError(null);
      } else {
        setError((res as { message?: string }).message || 'failed to load data source');
      }
    } catch (e) {
      console.error(e);
      setError('network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSource();
  }, [tableId, nodeId]);

  if (loading) {
    return (
      <TargetLayout>
        <div className="flex flex-col items-center justify-center py-64 animate-pulse">
          <Icons.loading className="size-12 animate-spin text-primary opacity-20" />
        </div>
      </TargetLayout>
    );
  }

  if (error || !source) {
    return (
      <TargetLayout>
        <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-8 animate-page-enter">
          <div className="size-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-xl shadow-rose-500/10">
            <Icons.warning className="size-10" />
          </div>
          <div className="space-y-3">
            <TextHeading size="h4" className="lowercase text-foreground/80 font-normal">
              {error || 'data source not found'}
            </TextHeading>
            <p className="text-lg text-muted-foreground lowercase opacity-60">
              we couldn't find the requested data source. it may have been deleted or moved.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            {L.buttons.goBack || 'go back'}
          </Button>
        </div>
      </TargetLayout>
    );
  }

  return (
    <TargetLayout>
      <div className="flex flex-col gap-6 md:gap-10 animate-page-enter">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between px-1 gap-6 md:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-1">
              <Icons.arrowLeft className="size-4 mr-2" />
              {L.labels.backToDataSources || 'back to database list'}
            </Button>
            <PageTitle
              title={source.name}
              subtitle={
                <>
                  {L.labels.manageRowsFor || 'manage rows for'}{' '}
                  <span className="text-primary">{source.tableName}</span>
                </>
              }
            />
          </div>

          <div className="flex items-center gap-4 bg-muted/20 p-2.5 rounded-[24px] border border-border/5">
            <Button
              onClick={() =>
                router.push(
                  nodeId
                    ? `/target/${nodeId}/database-schema/${source.id}/edit`
                    : `/database-schema/${source.id}/edit`,
                )
              }
              variant="default"
              size="sm"
            >
              <Icons.edit className="size-4 mr-2" /> edit schema
            </Button>
            <Button variant="default" size="icon-sm" onClick={() => fetchSource()}>
              <Icons.refresh />
            </Button>
          </div>
        </header>

        <main className="max-w-full overflow-hidden">
          <DataViewer DatabaseTable={source} />
        </main>
      </div>
    </TargetLayout>
  );
}

export default DataPage;
