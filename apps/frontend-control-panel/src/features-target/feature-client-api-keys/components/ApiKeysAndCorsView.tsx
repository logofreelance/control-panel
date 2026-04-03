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
  Skeleton,
  Modal,
  Heading,
  Text,
  Stack,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
} from '@/components/ui';
import { Icons } from '../config/icons';
import { API_KEYS_LABELS } from '../constants/ui-labels';
import { ConfirmDialog, useToast } from '@/modules/_core';
import { env } from '@/lib/env';
import { useClientApiKeys } from '../composables/useClientApiKeys';
import { useCorsDomains } from '../composables/useCorsDomains';
import { IntegrationGuide } from './IntegrationGuide';
import type { ClientApiKey, CorsDomain } from '../types';

const L = API_KEYS_LABELS;

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

  // Form states
  const [newKeyName, setNewKeyName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const loading = keysLoading || domainsLoading;
  const submitting = keysSubmitting || domainsSubmitting;

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

    setConfirmDialog(null);
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
    <div className="min-h-screen bg-background relative">
      <Container>
        <div className="relative z-10 pt-12 pb-20 space-y-8 animate-page-enter">
      {/* Show created key dialog if needed */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card  className="max-w-md w-full p-0">
            <CardContent>
              <Stack direction="row" gap={3} align="center" className="mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Icons.checkCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <Heading level={4} className="font-semibold">
                    API Key Created
                  </Heading>
                  <Text variant="muted" className="text-sm">
                    Simpan key ini dengan aman
                  </Text>
                </div>
              </Stack>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <code className="text-sm font-mono text-foreground break-all">{createdKey}</code>
              </div>
              <Text className="text-xs text-amber-700 mb-4">
                ⚠️ Key ini tidak akan ditampilkan lagi. Silakan copy dan simpan sekarang.
              </Text>
              <Stack direction="row" gap={2}>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => copyToClipboard(createdKey, 'Key copied!')}
                >
                  Copy
                </Button>
                <Button className="flex-1" onClick={() => setCreatedKey(null)}>
                  Done
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </div>
      )}

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading level={2} className="text-2xl sm:text-3xl mb-1">
            {L.title}
          </Heading>
          <Text variant="muted" className="text-sm">
            {L.subtitle}
          </Text>
        </div>
        <Badge variant="secondary" className="w-fit gap-1">
          <Icons.lock className="w-3 h-3" /> {L.labels.protected}
        </Badge>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative min-h-[140px]">
        {loading && <LoadingOverlay />}
        <Card  className="p-0">
          <CardContent className="p-4 sm:p-5">
            <Stack direction="row" justify="between" align="start" className="mb-3">
              <Text variant="muted" className="text-xs">
                {L.stats.apiKeys}
              </Text>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Icons.key className="w-3.5 h-3.5" />
              </div>
            </Stack>
            <div>
              <Heading level={4} className="text-2xl tracking-tight">
                {keys.length}
              </Heading>
              <Text variant="muted" className="text-[10px] mt-1">
                {L.stats.registered}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card  className="p-0">
          <CardContent className="p-4 sm:p-5">
            <Stack direction="row" justify="between" align="start" className="mb-3">
              <Text variant="muted" className="text-xs">
                {L.stats.activeKeys}
              </Text>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Icons.checkCircle className="w-3.5 h-3.5" />
              </div>
            </Stack>
            <div>
              <Heading level={4} className="text-2xl tracking-tight">
                {keys.filter((k: ClientApiKey) => k.is_active === 1).length}
              </Heading>
              <Text variant="muted" className="text-[10px] mt-1">
                {L.stats.valid}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card  className="p-0">
          <CardContent className="p-4 sm:p-5">
            <Stack direction="row" justify="between" align="start" className="mb-3">
              <Text variant="muted" className="text-xs">
                {L.stats.corsDomains}
              </Text>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Icons.globe className="w-3.5 h-3.5" />
              </div>
            </Stack>
            <div>
              <Heading level={4} className="text-2xl tracking-tight">
                {domains.length}
              </Heading>
              <Text variant="muted" className="text-[10px] mt-1">
                {L.stats.allowed}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card  className="p-0">
          <CardContent className="p-4 sm:p-5">
            <Stack direction="row" justify="between" align="start" className="mb-3">
              <Text variant="muted" className="text-xs">
                {L.stats.baseUrl}
              </Text>
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <Icons.rocket className="w-3.5 h-3.5" />
              </div>
            </Stack>
            <div>
              <p
                className="text-sm font-mono font-medium text-primary truncate"
                title={env.API_URL}
              >
                {env.API_URL}
              </p>
              <Text variant="muted" className="text-[10px] mt-1">
                {L.stats.apiEndpoint}
              </Text>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Keys & CORS Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys Section */}
        <Card  className="p-0 min-h-[300px] relative">
          {keysLoading && <LoadingOverlay />}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <Stack direction="row" gap={3} align="center">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Icons.key className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <Heading level={4} className="font-semibold text-sm">
                  {L.sections.apiAccessKeys}
                </Heading>
                <Text variant="muted" className="text-[10px]">
                  {L.labels.keys}
                </Text>
              </div>
            </Stack>
            <Stack direction="row" gap={2} align="center">
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hidden sm:block"
              >
                {keys.length} keys
              </Badge>
              <Button
                size="sm"
                className="p-0 flex items-center justify-center bg-background"
                onClick={() => setIsKeyModalOpen(true)}
              >
                <span className="h-8 w-8 p-0 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-none">
                  <Icons.plus className="w-5 h-5" />
                </span>
              </Button>
            </Stack>
          </div>
          <div className="p-4 sm:p-5 bg-muted/30 flex-1">
            <div className="space-y-2">
              {keys.map((k: ClientApiKey) => (
                <div
                  key={k.id}
                  className="group flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-border/80 transition-all duration-200"
                >
                  <Stack direction="row" gap={3} align="center" className="min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs shrink-0">
                      key
                    </div>
                    <div className="min-w-0">
                      <Text className="font-medium text-sm truncate">{k.name}</Text>
                      <code className="text-[10px] font-mono text-muted-foreground truncate w-24 sm:w-32 block">
                        {k.key_hash || '***'}
                      </code>
                    </div>
                  </Stack>
                  <Stack direction="row" gap={1.5} className="shrink-0 transition-all">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(k.key_hash || '', 'API Key copied!')}
                      className="w-9 h-9 rounded-lg bg-muted hover:bg-blue-50 flex items-center justify-center text-muted-foreground hover:text-blue-600 border border-border transition-all"
                      title="Copy Key"
                    >
                      <Icons.copy className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleKey(k.id, k.is_active === 0)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${k.is_active === 1 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-muted text-muted-foreground border border-border'}`}
                      title={k.is_active === 1 ? 'Disable' : 'Enable'}
                    >
                      {k.is_active === 1 ? (
                        <Icons.toggleOn className="w-5 h-5" />
                      ) : (
                        <Icons.toggleOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteDialog('api-key', k.id, k.name)}
                      className="w-9 h-9 rounded-lg bg-muted hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 border border-border transition-all"
                    >
                      <Icons.trash2 className="w-5 h-5" />
                    </button>
                  </Stack>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* CORS Domains Section */}
        <Card  className="p-0 min-h-[300px] relative">
          {domainsLoading && <LoadingOverlay />}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <Stack direction="row" gap={3} align="center">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Icons.globe className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <Heading level={4} className="font-semibold text-sm">
                  {L.sections.corsDomainsTitle}
                </Heading>
                <Text variant="muted" className="text-[10px]">
                  {L.labels.domains}
                </Text>
              </div>
            </Stack>
            <Stack direction="row" gap={2} align="center">
              <Badge
                variant="outline"
                className="px-2 py-0.5 text-[10px] font-medium bg-muted text-foreground hidden sm:block"
              >
                {domains.length} domains
              </Badge>
              <Button
                size="sm"
                className="p-0 flex items-center justify-center bg-background"
                onClick={() => setIsDomainModalOpen(true)}
              >
                <span className="h-8 w-8 p-0 rounded-lg flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 border-none">
                  <Icons.plus className="w-5 h-5" />
                </span>
              </Button>
            </Stack>
          </div>
          <div className="p-4 sm:p-5 bg-muted/30 flex-1">
            <div className="space-y-2">
              {domains.map((d: CorsDomain) => (
                <div
                  key={d.id}
                  className="group flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-border/80 transition-all duration-200"
                >
                  <Stack direction="row" gap={3} align="center" className="min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Icons.globe className="w-3.5 h-3.5" />
                    </div>
                    <code className="text-sm font-medium text-foreground truncate">
                      {d.domain_url}
                    </code>
                  </Stack>
                  <Stack direction="row" gap={1.5} className="shrink-0 transition-all">
                    <button
                      type="button"
                      onClick={() => toggleDomain(d.id, d.is_active === 0)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${d.is_active === 1 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-muted text-muted-foreground border border-border'}`}
                      title={d.is_active === 1 ? 'Disable' : 'Enable'}
                    >
                      {d.is_active === 1 ? (
                        <Icons.toggleOn className="w-5 h-5" />
                      ) : (
                        <Icons.toggleOff className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteDialog('cors', d.id, d.domain_url)}
                      className="w-9 h-9 rounded-lg bg-muted hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 border border-border transition-all"
                    >
                      <Icons.trash2 className="w-5 h-5" />
                    </button>
                  </Stack>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <IntegrationGuide copyToClipboard={copyToClipboard} />

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
        title={L.sections.apiAccessKeys}
      >
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div>
            <Text variant="muted" className="text-xs mb-1.5 block">
              {L.placeholders.keyName}
            </Text>
            <Input
              className="w-full"
              placeholder="e.g. Production Key, Mobile App"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Stack direction="row" justify="end" gap={3} className="pt-2">
            <Button variant="outline" type="button" onClick={() => setIsKeyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={keysSubmitting} disabled={keysSubmitting}>
              {L.buttons.create}
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Add Domain Modal */}
      <Modal
        isOpen={isDomainModalOpen}
        onClose={() => setIsDomainModalOpen(false)}
        title={L.sections.corsDomainsTitle}
      >
        <form onSubmit={handleAddDomain} className="space-y-4">
          <div>
            <Text variant="muted" className="text-xs mb-1.5 block">
              {L.placeholders.domain}
            </Text>
            <Input
              className="w-full"
              placeholder="https://example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              required
              autoFocus
            />
          </div>
          <Stack direction="row" justify="end" gap={3} className="pt-2">
            <Button variant="outline" type="button" onClick={() => setIsDomainModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={domainsSubmitting} disabled={domainsSubmitting}>
              {L.buttons.add}
            </Button>
          </Stack>
        </form>
      </Modal>
        </div>
      </Container>
    </div>
  );
};
