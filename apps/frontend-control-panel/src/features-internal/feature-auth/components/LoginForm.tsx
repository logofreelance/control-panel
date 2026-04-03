'use client';

import { Button, Input } from '@/components/ui';
import { AUTH_UI_LABELS } from '../constants/ui-labels';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { formData, setFormData, status, handleLogin } = useAuth();

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <Input
        label={AUTH_UI_LABELS.login.username}
        placeholder={AUTH_UI_LABELS.login.usernameExample}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        required
      />

      <Input
        label={AUTH_UI_LABELS.login.password}
        type="password"
        placeholder={AUTH_UI_LABELS.login.passwordPlaceholder}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <Button
        type="submit"
        variant="default"
        size="default"
        className="w-full mt-2"
        isLoading={status?.loading}
      >
        {AUTH_UI_LABELS.login.signInToEngine}
      </Button>

      {status?.message && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold text-center border border-destructive/20 animate-in fade-in slide-in-from-top-1 uppercase">
          {status.message}
        </div>
      )}
    </form>
  );
}
