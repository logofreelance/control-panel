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

import { Card, CardContent, Button, Badge, Skeleton, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
};

export const AppUserTable = ({ users, loading, onEdit, onDelete }: AppUserTableProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl bg-muted/20" />
                ))}
            </div>
        );
    }

    if (!users.length) {
        return (
             <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-muted/5">
                 <div className="size-16 rounded-3xl bg-muted/20 mx-auto flex items-center justify-center mb-6">
                    <Icons.users className="size-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-sm font-semibold text-foreground mb-1 lowercase">{L.empty.title}</h3>
                 <p className="text-xs text-muted-foreground lowercase font-normal">{L.empty.subtitle.toLowerCase()}</p>
             </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-none">
                <Table className="w-full">
                    <TableHeader className="bg-muted/5 border-b border-border">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="h-12 px-8 text-left text-xs font-normal lowercase text-muted-foreground">{L.table.user}</TableHead>
                            <TableHead className="h-12 px-6 text-left text-xs font-normal lowercase text-muted-foreground">{L.table.email}</TableHead>
                            <TableHead className="h-12 px-6 text-center text-xs font-normal lowercase text-muted-foreground">{L.table.role}</TableHead>
                            <TableHead className="h-12 px-8 text-right text-xs font-normal lowercase text-muted-foreground">{L.table.status}</TableHead>
                            <TableHead className="h-12 px-8 text-right text-xs font-normal lowercase text-muted-foreground">{L.table.joinedAt}</TableHead>
                            <TableHead className="h-12 px-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="group border-border hover:bg-muted/5 transition-all font-instrument">
                                <TableCell className="px-8 py-3.5">
                                    <span className="text-base font-normal text-foreground">
                                        {user.username}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-3.5 text-sm font-normal text-muted-foreground">
                                    {user.email}
                                </TableCell>
                                <TableCell className="px-6 py-3.5 text-center">
                                    <Badge className="h-7 px-3 rounded-full border border-border bg-muted/20 text-foreground text-xs font-normal lowercase transition-colors shadow-none">
                                        {user.roleDisplayName?.toLowerCase() || user.role?.toLowerCase() || 'user'}
                                        {user.roleIsSuper && <Icons.crown className="size-3 ml-1.5 opacity-60" />}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-8 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="text-xs font-normal text-foreground lowercase">
                                            {user.isActive ? L.table.active : L.table.inactive}
                                        </span>
                                        <div
                                            className={cn(
                                            'size-2 rounded-full',
                                            user.isActive
                                                ? 'bg-chart-2 shadow-[0_0_12px_var(--chart-2)]'
                                                : 'bg-destructive shadow-[0_0_12px_var(--destructive)]',
                                            )}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className="px-8 py-3.5 text-right text-xs font-normal text-muted-foreground lowercase">
                                    {formatDate(user.createdAt)}
                                </TableCell>
                                <TableCell className="px-6 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => onEdit(user)}
                                        >
                                            <Icons.pencil className="size-3.5" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => onDelete(user)}
                                        >
                                            <Icons.trash className="size-3.5" />
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
                    <Card key={user.id} className="border border-border bg-card shadow-none rounded-2xl overflow-hidden">
                        <CardContent className="p-5 flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-base font-normal text-foreground leading-tight">
                                        {user.username}
                                    </span>
                                    <span className="text-xs font-normal text-muted-foreground truncate max-w-[200px]">
                                        {user.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
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
                                    <Badge className="h-7 px-3 rounded-full border border-border bg-muted/20 text-foreground text-xs font-normal lowercase shadow-none">
                                        {user.roleDisplayName?.toLowerCase().slice(0, 15) || user.role?.toLowerCase() || 'user'}
                                        {user.roleIsSuper && <Icons.crown className="size-3 ml-1.5 opacity-60" />}
                                    </Badge>
                                    
                                    <div className="flex items-center gap-2 px-2 py-1 bg-muted/5 rounded-full border border-border/50">
                                        <div className={cn(
                                            'size-1.5 rounded-full',
                                            user.isActive ? 'bg-chart-2' : 'bg-destructive'
                                        )} />
                                        <span className="text-xs font-normal text-foreground lowercase">
                                            {user.isActive ? 'active' : 'inactive'}
                                        </span>
                                    </div>
                                </div>
                                
                                <span className="text-[10px] font-normal text-muted-foreground lowercase shrink-0">
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
