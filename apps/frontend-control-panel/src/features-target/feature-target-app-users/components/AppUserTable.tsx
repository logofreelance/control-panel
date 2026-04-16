'use client';

/**
 * AppUserTable - Refactored to Analytics Style (MonitorAnalyticsView.tsx)
 *
 * STICKING TO RULES:
 * - No tracking-*
 * - No text size < text-xs
 * - No text color opacity (text-foreground/80)
 * - Standard Button usage only
 *
 * UPDATES:
 * - Removed avatar circles next to name
 * - Mobile view optimized to avoid horizontal scrolling (Stacked Layout)
 */

import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { Icons } from '../config/icons';
import { APP_USER_LABELS } from '../constants/ui-labels';
import { cn } from '@/lib/utils';
import type { AppUser } from '../types/app-user.types';

const L = APP_USER_LABELS;

interface AppUserTableProps {
  users: AppUser[];
  loading?: boolean;
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toLowerCase();
};

export const AppUserTable = ({ users, loading, onEdit, onDelete }: AppUserTableProps) => {

  if (!users.length) {
    return (
      <div className="py-4 text-center border border-dashed border-border rounded-xl bg-muted p-4">
        <div className="size-16 rounded-xl bg-background mx-auto flex items-center justify-center mb-4">
          <Icons.users className="size-8 text-muted-foreground" />
        </div>
        <TextHeading size="h3" className="mb-1 text-foreground">{L.empty.title}</TextHeading>
        <p className="text-base font-normal text-muted-foreground">{L.empty.subtitle}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <Table className="w-full">
          <TableHeader className="bg-muted border-b border-border">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-12 px-6 text-left text-base font-normal lowercase text-muted-foreground">
                {L.table.user}
              </TableHead>
              <TableHead className="h-12 px-6 text-left text-base font-normal lowercase text-muted-foreground">
                {L.table.email}
              </TableHead>
              <TableHead className="h-12 px-6 text-center text-base font-normal lowercase text-muted-foreground">
                {L.table.role}
              </TableHead>
              <TableHead className="h-12 px-6 text-right text-base font-normal lowercase text-muted-foreground">
                {L.table.status}
              </TableHead>
              <TableHead className="h-12 px-6 text-right text-base font-normal lowercase text-muted-foreground">
                {L.table.joinedAt}
              </TableHead>
              <TableHead className="h-12 px-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="group border-border hover:bg-muted transition-all font-instrument"
              >
                <TableCell className="px-6 py-3.5">
                  <span className="text-base font-normal text-foreground">{user.username}</span>
                </TableCell>
                <TableCell className="px-6 py-3.5 text-base font-normal text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-center">
                  <Badge variant="secondary" className="h-7 px-3 rounded-full font-normal lowercase transition-colors">
                    {user.roleDisplayName?.toLowerCase() || user.role?.toLowerCase() || 'user'}
                    {user.roleIsSuper && <Icons.crown className="size-4 ml-1.5" />}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span className="text-base font-normal text-foreground lowercase">
                      {user.isActive ? L.table.active : L.table.inactive}
                    </span>
                    <div
                      className={cn(
                        'size-2 rounded-full',
                        user.isActive
                          ? 'bg-primary'
                          : 'bg-destructive',
                      )}
                    />
                  </div>
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right text-base font-normal text-muted-foreground lowercase">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                      <Icons.pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked View - Optimized No Scroll */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="border border-border bg-card shadow-none rounded-2xl overflow-hidden"
          >
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-normal text-foreground leading-tight">
                    {user.username}
                  </span>
                  <span className="text-base font-normal text-muted-foreground truncate max-w-[200px]">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                    <Icons.pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(user)}>
                    <Icons.trash className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-4 mt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="h-7 px-3 rounded-full font-normal lowercase">
                    {user.roleDisplayName?.toLowerCase().slice(0, 15) ||
                      user.role?.toLowerCase() ||
                      'user'}
                    {user.roleIsSuper && <Icons.crown className="size-4 ml-1.5" />}
                  </Badge>

                  <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-full">
                    <div
                      className={cn(
                        'size-2 rounded-full',
                        user.isActive ? 'bg-primary' : 'bg-destructive',
                      )}
                    />
                    <span className="text-base font-normal text-foreground lowercase">
                      {user.isActive ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>

                <span className="text-base font-normal text-muted-foreground lowercase shrink-0">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
