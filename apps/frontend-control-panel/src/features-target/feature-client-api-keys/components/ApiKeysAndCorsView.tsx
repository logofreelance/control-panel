/**
 * feature-client-api-keys - ApiKeysAndCorsView
 *
 * Main view yang menggabungkan API Keys dan CORS Domains management.
 * Menggunakan backend routes yang benar (/api/api-keys, /api/cors).
 */

'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  Modal,
  Select,
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { cn } from '@/lib/utils';
import { Icons } from '../config/icons';
import { API_KEYS_LABELS } from '../constants/ui-labels';
import { ConfirmDialog, useToast } from '@/modules/_core';
import { env } from '@/lib/env';
import { useClientApiKeys } from '../composables/useClientApiKeys';
import { useCorsDomains } from '../composables/useCorsDomains';

import { TargetLayout } from '@/components/layout/TargetLayout';
import { useTargetRegistry } from '@/features-internal/feature-target-registry/hooks/useTargetRegistry';
import type { ClientApiKey, CorsDomain } from '../types';
import { useEffect } from 'react';

const L = API_KEYS_LABELS;

// Helper to determine the Engine's URL based on Control Panel's URL
const getTargetApiUrl = () => {
  let url = env.API_URL || 'http://localhost:3001/api';
  
  // Convert local port 3001 (Control Panel) to 3002 (Engine)
  url = url.replace(':3001', ':3002');
  
  // Convert production worker name
  url = url.replace('backend-control-panel', 'backend-system');
  
  return url;
};

interface ConfirmDialogState {
  type: 'api-key' | 'cors';
  id: string;
  name: string;
}

interface ApiKeysAndCorsViewProps {
  targetId?: string;
}

export const ApiKeysAndCorsView = ({ targetId }: ApiKeysAndCorsViewProps) => {
  const { addToast } = useToast();
  const {
    keys,
    loading: keysLoading,
    submitting: keysSubmitting,
    createKey,
    deleteKey,
    toggleKey,
  } = useClientApiKeys(targetId);

  const {
    domains,
    loading: domainsLoading,
    submitting: domainsSubmitting,
    createDomain,
    deleteDomain,
    toggleDomain,
  } = useCorsDomains(targetId);

  const { targets, checkHealth } = useTargetRegistry();
  const currentTarget = targets.find(t => t.id === targetId);
  const [isSyncing, setIsSyncing] = useState(false);


  // Form states
  const [newKeyName, setNewKeyName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const loading = keysLoading || domainsLoading;
  const submitting = keysSubmitting || domainsSubmitting;
  
  // Prefer database api_endpoint if available, fallback to environment heuristic
  const rawTargetApiUrl = currentTarget?.apiEndpoint || getTargetApiUrl();
  
  // Handle multiple endpoints (comma-separated) and ensure they have /api
  const targetApiUrls = rawTargetApiUrl.split(',').map(url => {
    const trimmed = url.trim();
    // If it already ends with /api, leave it. Otherwise append /api.
    return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
  });

  
  // Use the primary one for the examples/guide
  const primaryApiUrl = targetApiUrls[0];

  // Handlers
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const key = await createKey(newKeyName.trim());
    if (key) {
      setCreatedKey(key);
      setNewKeyName('');
      setIsKeyModalOpen(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    const success = await createDomain(newDomain.trim());
    if (success) {
      setNewDomain('');
      setIsDomainModalOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog) return;

    if (confirmDialog.type === 'api-key') {
      await deleteKey(confirmDialog.id);
    } else {
      await deleteDomain(confirmDialog.id);
    }

    setCreatedKey(null);
  };

  const handleSync = async () => {
    if (isSyncing || !targetId) return;
    setIsSyncing(true);
    try {
      await checkHealth(targetId);
      addToast(L.messages.syncSuccess, 'success');
    } catch {
      addToast(L.messages.syncFailed, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (
    text: string,
    message: string = L.messages.copiedToClipboard || 'Copied to clipboard!',
  ) => {
    if (!text || text === '***') {
      addToast('Nothing to copy', 'error');
      return;
    }

    // Try modern navigator.clipboard first
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          addToast(message, 'success');
        })
        .catch(() => {
          // Fallback if navigator.clipboard fails
          copyFallback(text, message);
        });
    } else {
      // Fallback if navigator.clipboard is missing (e.g. non-secure context)
      copyFallback(text, message);
    }
  };

  const copyFallback = (text: string, message: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        addToast(message, 'success');
      } else {
        addToast('Failed to copy', 'error');
      }
    } catch (err) {
      addToast('Copy not supported on this browser', 'error');
    }
  };

  const openDeleteDialog = (type: 'api-key' | 'cors', id: string, name: string) => {
    setConfirmDialog({ type, id, name });
  };

  const closeDeleteDialog = () => {
    setConfirmDialog(null);
  };

  const getConfirmDialogTitle = () => {
    if (!confirmDialog) return '';
    return confirmDialog.type === 'api-key' ? L.confirm.deleteApiKey : L.confirm.removeCors;
  };

  const getConfirmDialogMessage = () => {
    if (!confirmDialog) return '';
    return `${L.confirm.deleteMessage} "${confirmDialog.name}"? ${L.confirm.cannotUndo}`;
  };

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-xl">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <TargetLayout>
      <div className="relative z-10 pt-12 pb-20 space-y-8 animate-page-enter">
      {/* Show created key dialog if needed */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="max-w-md w-full animate-in zoom-in-95 duration-200">
            <CardContent>
              <div className="flex flex-row gap-4 items-center mb-6 pt-6">
                <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                  <Icons.checkCircle className="size-6 text-emerald-600" />
                </div>
                <div>
                  <TextHeading size="h3" className="font-semibold lowercase">
                    api key created
                  </TextHeading>
                  <p className="text-base text-muted-foreground lowercase">
                    save this key securely now
                  </p>
                </div>
              </div>
              <div className="bg-muted rounded-xl p-5 mb-6 select-all">
                <p className="text-base text-foreground break-all leading-relaxed">{createdKey}</p>
              </div>
              <p className="text-base text-rose-500 mb-6 lowercase">
                this key will not be shown again. please copy and save it immediately.
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 lowercase"
                  onClick={() => copyToClipboard(createdKey, 'key copied!')}
                >
                  copy key
                </Button>
                <Button className="flex-1 lowercase" onClick={() => setCreatedKey(null)}>
                  done
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <TextHeading size="h1" className="mb-1 lowercase">
            {L.title}
          </TextHeading>
          <p className="text-base text-muted-foreground lowercase">
            {L.subtitle}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSync}
            disabled={isSyncing}
            title="Sync Endpoints"
          >
            <Icons.refreshCw className={`size-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {loading && <LoadingOverlay />}
        <Card>
          <CardContent>
            <div className="flex flex-row justify-between items-start mb-6">
              <p className="text-base font-normal text-muted-foreground lowercase">
                {L.stats.apiKeys}
              </p>
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary">
                <Icons.key className="size-5" />
              </div>
            </div>
            <div>
              <TextHeading size="h2" className="lowercase">
                {keys.length}
              </TextHeading>
              <p className="text-base font-normal text-muted-foreground mt-1 lowercase">
                {L.stats.registered}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex flex-row justify-between items-start mb-6">
              <p className="text-base font-normal text-muted-foreground lowercase">
                {L.stats.activeKeys}
              </p>
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-emerald-600">
                <Icons.checkCircle className="size-5" />
              </div>
            </div>
            <div>
              <TextHeading size="h2" className="lowercase">
                {keys.filter((k: ClientApiKey) => k.is_active === 1).length}
              </TextHeading>
              <p className="text-base font-normal text-muted-foreground mt-1 lowercase">
                {L.stats.valid}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex flex-row justify-between items-start mb-6">
              <p className="text-base font-normal text-muted-foreground lowercase">
                {L.stats.corsDomains}
              </p>
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-blue-600">
                <Icons.globe className="size-5" />
              </div>
            </div>
            <div>
              <TextHeading size="h2" className="lowercase">
                {domains.length}
              </TextHeading>
              <p className="text-base font-normal text-muted-foreground mt-1 lowercase">
                {L.stats.allowed}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex flex-row justify-between items-start mb-6">
              <p className="text-base font-normal text-muted-foreground lowercase">
                {L.stats.activeNodes}
              </p>
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Icons.rocket className="size-5" />
              </div>
            </div>
            <div className="flex flex-row justify-between items-end">
              <div>
                <TextHeading size="h2" className="lowercase">
                  {targetApiUrls.length}
                </TextHeading>
                <p className="text-base font-normal text-muted-foreground mt-1 lowercase">
                  {L.stats.apiEndpoint}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Keys & CORS Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys Section */}
        <Card>
          {keysLoading && <LoadingOverlay />}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex flex-row gap-4 items-center">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Icons.key className="size-5" />
              </div>
              <div>
                <TextHeading size="h4" className="lowercase">
                  {L.sections.apiAccessKeys}
                 </TextHeading>
                <p className="text-base font-normal text-muted-foreground lowercase">
                  {L.labels.keys}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-3 items-center">
              <Badge variant="secondary" className="hidden sm:inline-flex lowercase">
                {keys.length} keys
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsKeyModalOpen(true)}
              >
                <Icons.plus className="size-5" />
              </Button>
            </div>
          </div>
          <CardContent>
            <div className="space-y-4">
              {keys.map((k: ClientApiKey) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-xl group transition-all"
                >
                  <div className="flex flex-row gap-4 items-center min-w-0">
                    <div className="size-10 rounded-xl bg-background flex items-center justify-center text-amber-600 font-semibold text-base shrink-0">
                      key
                    </div>
                    <div className="min-w-0">
                      <p className="font-normal text-base text-foreground truncate lowercase">{k.name}</p>
                      <p className="text-base text-muted-foreground truncate max-w-[120px] sm:max-w-[200px] lowercase">
                        {k.key_hash || "********"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(k.key_hash || '', 'key copied!')}
                    >
                      <Icons.copy className="size-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleKey(k.id, k.is_active === 0)}
                      className={cn(k.is_active === 1 ? 'text-emerald-600' : 'text-muted-foreground')}
                    >
                      {k.is_active === 1 ? <Icons.toggleOn className="size-6" /> : <Icons.toggleOff className="size-6" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog('api-key', k.id, k.name)}
                      className="text-destructive"
                    >
                      <Icons.trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CORS Domains Section */}
        <Card>
          {domainsLoading && <LoadingOverlay />}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex flex-row gap-4 items-center">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <Icons.globe className="size-5" />
              </div>
              <div>
                <TextHeading size="h4" className="lowercase">
                  {L.sections.corsDomainsTitle}
                </TextHeading>
                <p className="text-base font-normal text-muted-foreground lowercase">
                  {L.labels.domains}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-3 items-center">
              <Badge variant="secondary" className="hidden sm:inline-flex lowercase">
                {domains.length} domains
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDomainModalOpen(true)}
              >
                <Icons.plus className="size-5" />
              </Button>
            </div>
          </div>
          <CardContent>
            <div className="space-y-4">
              {domains.map((d: CorsDomain) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-xl group transition-all"
                >
                  <div className="flex flex-row gap-4 items-center min-w-0">
                    <div className="size-10 rounded-xl bg-background flex items-center justify-center text-primary shrink-0">
                      <Icons.globe className="size-5" />
                    </div>
                    <p className="text-base font-normal text-foreground truncate lowercase">
                      {d.domain_url}
                    </p>
                  </div>
                  <div className="flex flex-row gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleDomain(d.id, d.is_active === 0)}
                      className={cn(d.is_active === 1 ? 'text-emerald-600' : 'text-muted-foreground')}
                    >
                      {d.is_active === 1 ? <Icons.toggleOn className="size-6" /> : <Icons.toggleOff className="size-6" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog('cors', d.id, d.domain_url)}
                      className="text-destructive"
                    >
                      <Icons.trash2 className="size-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target API URLs List Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-1 text-muted-foreground">
          <Icons.link2 className="size-5" />
          <h3 className="text-base font-normal uppercase tracking-wider">{L.stats.apiEndpoint}</h3>
        </div>
        
        <Card>
          <CardContent>
            <div className="flex flex-col gap-1">
              {targetApiUrls.map((url, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-2 hover:bg-muted rounded-xl transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0 transition-colors">
                      <Icons.link2 className="size-5" />
                    </div>
                    <span className="text-base font-normal text-foreground truncate">
                      {url}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(url, L.messages.urlCopied)}
                  >
                    <Icons.copy className="size-5" />
                  </Button>
                </div>
              ))}
              {targetApiUrls.length === 0 && (
                <div className="p-6 text-center text-muted-foreground text-base font-normal lowercase">
                  no api endpoints discovered
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>


      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title={getConfirmDialogTitle()}
        message={getConfirmDialogMessage()}
        confirmText={L.confirm.deleteApiKey.split(' ')[0]}
        variant="danger"
        loading={submitting}
      />

      {/* Create Key Modal */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title={L.sections.apiAccessKeys.toLowerCase()}
      >
        <form onSubmit={handleCreateKey} className="space-y-4 pt-2">
          <div>
            <p className="text-base font-normal text-muted-foreground mb-2 lowercase">
              {L.placeholders.keyName}
            </p>
            <Input
              placeholder="e.g. production key, mobile app"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-row justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsKeyModalOpen(false)} className="lowercase">
              cancel
            </Button>
            <Button type="submit" disabled={keysSubmitting} className="lowercase">
              {submitting ? 'creating...' : L.buttons.create}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Domain Modal */}
      <Modal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        title={L.sections.corsDomainsTitle.toLowerCase()}
      >
        <form onSubmit={handleAddDomain} className="space-y-4 pt-2">
          <div>
            <p className="text-base font-normal text-muted-foreground mb-2 lowercase">
              {L.placeholders.domain}
            </p>
            <Input
              placeholder="https://example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="flex flex-row justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setIsDomainModalOpen(false)} className="lowercase">
              cancel
            </Button>
            <Button type="submit" disabled={domainsSubmitting} className="lowercase">
              {submitting ? 'adding...' : L.buttons.add}
            </Button>
          </div>
        </form>
      </Modal>
        </div>
    </TargetLayout>
  );
};
