import Link from 'next/link';
import { Button, Input, Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../config/icons';
import { AUTH_UI_LABELS } from '../constants/ui-labels';
import { AUTH_ROUTES } from '../config/routes';
import { useUserSettings } from '../hooks/useUserSettings';
import { InternalLayout } from '@/components/layout/InternalLayout';

export function UserSettingsView() {
  const {
    loading,
    profileData,
    setProfileData,
    passwordData,
    setPasswordData,
    profileStatus,
    passwordStatus,
    handleLogout,
    handleUpdateProfile,
    handleChangePassword,
  } = useUserSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-12 rounded-2xl bg-card border border-border/50 shadow-xl shadow-primary/5 flex items-center justify-center">
          <Icons.loading className="size-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <InternalLayout>
      <div className="max-w-2xl mx-auto px-6 relative z-10 pt-32 pb-20">
        <div className="py-12">
          {/* Page Title Section */}
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-sm text-primary"
            >
              {AUTH_UI_LABELS.settings.badge}
            </Badge>
            <TextHeading size="h1" className="mb-3">
              {AUTH_UI_LABELS.settings.title}
            </TextHeading>
            <p className="text-muted-foreground/95 max-w-xl mx-auto text-lg md:text-lg leading-relaxed font-light">
              {AUTH_UI_LABELS.settings.subtitle}
            </p>
          </div>

          {/* Identity Management Section */}
          <Card className="w-full mb-8">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                  <Icons.user className="size-5" />
                </div>
                <div>
                  <CardTitle>{AUTH_UI_LABELS.identity.title}</CardTitle>
                  <p className="text-sm md:text-base text-muted-foreground/85 font-light">
                    Update account information
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <Input
                  label={AUTH_UI_LABELS.identity.usernameLabel}
                  value={profileData.newUsername}
                  onChange={(e) => setProfileData({ newUsername: e.target.value })}
                  placeholder={AUTH_UI_LABELS.identity.usernamePlaceholder}
                  required
                />

                {profileStatus?.message && (
                  <div
                    className={`p-4 rounded-xl border font-semibold uppercase animate-page-enter ${
                      profileStatus.type === 'success'
                        ? 'bg-primary/5 border-primary/20 text-primary'
                        : 'bg-destructive/5 border-destructive/20 text-destructive'
                    }`}
                  >
                    {profileStatus.message}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    isLoading={profileStatus?.loading}
                  >
                    {AUTH_UI_LABELS.identity.updateButton}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Management Section */}
          <Card className="w-full mb-12">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                  <Icons.key className="size-5" />
                </div>
                <div>
                  <CardTitle>{AUTH_UI_LABELS.credentials.title}</CardTitle>
                  <p className="text-sm md:text-base text-muted-foreground/85 font-light">
                    Security settings
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <Input
                  label={AUTH_UI_LABELS.credentials.currentPasswordLabel}
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder={AUTH_UI_LABELS.credentials.passwordPlaceholder}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label={AUTH_UI_LABELS.credentials.newPasswordLabel}
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder={AUTH_UI_LABELS.credentials.passwordPlaceholder}
                    required
                  />
                  <Input
                    label={AUTH_UI_LABELS.credentials.confirmLabel}
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder={AUTH_UI_LABELS.credentials.passwordPlaceholder}
                    required
                  />
                </div>

                {passwordStatus?.message && (
                  <div
                    className={`p-4 rounded-xl border font-semibold uppercase animate-page-enter ${
                      passwordStatus.type === 'success'
                        ? 'bg-primary/5 border-primary/20 text-primary'
                        : 'bg-destructive/5 border-destructive/20 text-destructive'
                    }`}
                  >
                    {passwordStatus.message}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    isLoading={passwordStatus?.loading}
                  >
                    {AUTH_UI_LABELS.credentials.changeButton}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="w-full border-destructive/25 bg-destructive/5/20">
            <CardContent className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-col gap-1.5">
                  <TextHeading
                    size="h4"
                    weight="semibold"
                    className="text-destructive"
                  >
                    {AUTH_UI_LABELS.dangerZone.title}
                  </TextHeading>
                  <p className="text-destructive/80 text-sm md:text-base font-light leading-tight">
                    {AUTH_UI_LABELS.dangerZone.subtitle}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="default"
                  onClick={handleLogout}
                  className="shadow-lg shadow-destructive/10"
                >
                  <Icons.logout className="size-4 mr-2" />
                  {AUTH_UI_LABELS.dangerZone.signOut}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </InternalLayout>
  );
}
