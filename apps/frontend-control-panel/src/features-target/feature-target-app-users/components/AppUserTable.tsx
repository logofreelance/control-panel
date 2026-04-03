'use client';

import { Card, CardContent, Button, Badge, Skeleton, Stack, Text } from '@/components/ui';
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

const getRoleStyle = (user: AppUser) => {
    const level = user.roleLevel;
    if (level !== null && level !== undefined) {
        if (level >= 90) return 'bg-destructive/10 text-destructive';
        if (level >= 70) return 'bg-amber-500/10 text-amber-600';
        if (level >= 50) return 'bg-primary/10 text-primary';
        if (level >= 30) return 'bg-purple-500/10 text-purple-600';
        return 'bg-muted text-muted-foreground';
    }
    const lowerRole = user.role?.toLowerCase() || '';
    if (lowerRole.includes('super')) return 'bg-destructive/10 text-destructive';
    if (lowerRole.includes('admin')) return 'bg-amber-500/10 text-amber-600';
    if (lowerRole.includes('designer')) return 'bg-primary/10 text-primary';
    if (lowerRole.includes('affiliate')) return 'bg-purple-500/10 text-purple-600';
    return 'bg-muted text-muted-foreground';
};

const formatRoleName = (user: AppUser) => {
    if (user.roleDisplayName) return user.roleDisplayName;
    if (!user.role) return L.table.defaultRole;
    return user.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const AppUserTable = ({ users, loading, onEdit, onDelete }: AppUserTableProps) => {
    if (loading) {
        return (
            <Card >
                <CardContent className="p-5 space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!users.length) {
        return (
            <Card  className="p-16 text-center">
                <Icons.user className="size-10 mx-auto mb-4 text-border" />
                <Text>{L.empty.title}</Text>
                <Text variant="muted">{L.empty.subtitle}</Text>
            </Card>
        );
    }

    return (
        <Card >
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/30 border-b border-border">
                        <tr>
                            <th className="py-3 px-5 text-left text-[11px] font-semibold text-muted-foreground uppercase">{L.table.user}</th>
                            <th className="py-3 px-5 text-left text-[11px] font-semibold text-muted-foreground uppercase">{L.table.email}</th>
                            <th className="py-3 px-5 text-left text-[11px] font-semibold text-muted-foreground uppercase">{L.table.role}</th>
                            <th className="py-3 px-5 text-left text-[11px] font-semibold text-muted-foreground uppercase">{L.table.status}</th>
                            <th className="py-3 px-5 text-left text-[11px] font-semibold text-muted-foreground uppercase">{L.table.joinedAt}</th>
                            <th className="py-3 px-5 w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {users.map((user) => (
                            <tr key={user.id} className="group hover:bg-muted/20 transition-colors">
                                <td className="py-3 px-5">
                                    <Stack direction="row" gap={3} align="center">
                                        <div className="size-9 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold text-sm">
                                            {user.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <Text className="text-sm">{user.username}</Text>
                                    </Stack>
                                </td>
                                <td className="py-3 px-5 text-muted-foreground text-sm">{user.email}</td>
                                <td className="py-3 px-5">
                                    <Badge className={cn("rounded-lg text-[11px]", getRoleStyle(user))}>
                                        {formatRoleName(user)}
                                        {user.roleIsSuper && <Icons.crown className="size-3 ml-1" />}
                                    </Badge>
                                </td>
                                <td className="py-3 px-5">
                                    <Badge variant={user.isActive ? "success" : "destructive"}>
                                        {user.isActive ? L.table.active : L.table.inactive}
                                    </Badge>
                                </td>
                                <td className="py-3 px-5 text-muted-foreground text-sm">{formatDate(user.createdAt)}</td>
                                <td className="py-3 px-5">
                                    <Stack direction="row" gap={1} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(user)}>
                                            <Icons.pencil className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon-sm" onClick={() => onDelete(user)}>
                                            <Icons.trash className="size-4 text-destructive" />
                                        </Button>
                                    </Stack>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
                {users.map((user) => (
                    <div key={user.id} className="p-4">
                        <Stack direction="row" justify="between" align="start" className="mb-3">
                            <Stack direction="row" gap={3} align="center" className="min-w-0">
                                <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-foreground font-semibold shrink-0">
                                    {user.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <Text className="text-sm truncate">{user.username}</Text>
                                    <Text variant="muted" className="truncate">{user.email}</Text>
                                </div>
                            </Stack>
                            <Stack direction="row" gap={1}>
                                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(user)}>
                                    <Icons.pencil className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => onDelete(user)}>
                                    <Icons.trash className="size-4 text-destructive" />
                                </Button>
                            </Stack>
                        </Stack>
                        <Stack direction="row" gap={2} wrap>
                            <Badge className={cn("rounded-lg text-[10px]", getRoleStyle(user))}>
                                {formatRoleName(user)}
                                {user.roleIsSuper && <Icons.crown className="size-2.5 ml-1" />}
                            </Badge>
                            <Badge variant={user.isActive ? "success" : "destructive"} className="text-[10px]">
                                {user.isActive ? L.table.active : L.table.inactive}
                            </Badge>
                            <Text variant="detail" className="bg-muted/50 rounded-lg px-2 py-1">
                                {formatDate(user.createdAt)}
                            </Text>
                        </Stack>
                    </div>
                ))}
            </div>
        </Card>
    );
};
