'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { 
    Button, 
    Badge, 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardFooter,
    Input
} from '@/components/ui';
import { TextHeading } from '@/components/ui/text-heading';
import { Icons } from '../config/icons';
import { TARGET_UI_LABELS } from '../constants/ui-labels';
import { TARGET_ROUTES } from '../config/routes';
import { STATUS_CONFIG } from '../constants/status-config';
import { timeAgo } from '../services/target-utils';
import { useTargetManagement } from '../hooks/useTargetManagement';
import { TargetFormModal } from './TargetFormModal';
import { ConfirmDialog } from '@/modules/_core/components/ConfirmDialog';
import { InternalLayout } from '@/components/layout/InternalLayout';

/**
 * DecorativeHeroBackground
 */
const DecorativeHeroBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40">
    <div className="absolute top-[10%] left-[-20%] md:left-[-10%] w-64 md:w-[800px] h-64 md:h-[800px] bg-foreground/2 rounded-full animate-float" />
    <div className="absolute bottom-[20%] right-[-15%] md:right-[-10%] w-72 md:w-[900px] h-72 md:h-[900px] bg-foreground/1 rounded-full animate-float-slow" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--foreground)_1px,transparent_1px)] opacity-[0.02] bg-size-[100px_100px] md:bg-size-[150px_150px]" />
  </div>
);

export function TargetRegistryView() {
    const router = useRouter();
    const {
        loading,
        saving,
        showModal,
        setShowModal,
        editingTarget,
        deletingId,
        checkingId,
        confirmDeleteId,
        setConfirmDeleteId,
        searchQuery,
        setSearchQuery,
        onlineCount,
        filteredTargets,
        handleAdd,
        handleEdit,
        handleSave,
        handleDelete,
        executeDelete,
        handleCheckHealth,
        testConnection,
        targets,
    } = useTargetManagement();

    return (
        <div className="w-full">
            {/* HERO SECTION */}
            <div className="relative w-full min-h-[45vh] flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-hidden border-b border-border/40">
                <DecorativeHeroBackground />
                
                <div className="w-full max-w-5xl mx-auto text-center flex flex-col items-center gap-10 relative z-10 font-instrument">
                    {/* ... Registry Hero Content ... */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 justify-center mb-6 opacity-60">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-none">
                                {onlineCount} of {targets.length} systems operational
                            </span>
                        </div>
                        
                        <TextHeading size="h1" className="mb-6 tracking-tight leading-none text-6xl md:text-7xl font-bold">
                            System Registry
                        </TextHeading>
                        
                        <p className="text-muted-foreground/80 text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto opacity-70">
                            {TARGET_UI_LABELS.hero.subtitle}
                        </p>
                    </div>

                    {/* Standardized Search + Add Button */}
                    <div className="w-full max-w-2xl flex flex-col md:flex-row items-center gap-3 relative z-10">
                        <div className="flex-1 w-full relative group">
                            <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30 transition-colors group-focus-within:text-primary z-10" />
                            <Input
                                className="pl-11 pr-14 h-12 bg-background/50 backdrop-blur-md rounded-2xl border-border/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all hover:border-primary/40 outline-none shadow-sm"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search system nodes..."
                            />
                        </div>

                        <Button 
                            variant="default" 
                            size="lg"
                            onClick={handleAdd}
                            className="w-full md:w-auto h-12 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all font-bold px-8 font-instrument"
                        >
                            <Icons.plus className="size-5 mr-2" />
                            Register System
                        </Button>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID SECTION */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 pb-32 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ... Target Cards ... */}
                    {!loading && filteredTargets.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-center bg-foreground/[0.02] border border-dashed border-border/40 rounded-[40px] font-instrument">
                            <div className="size-20 rounded-[32px] bg-background border border-border/10 shadow-sm flex items-center justify-center mb-6 shadow-sm">
                                <Icons.network className="size-10 text-muted-foreground/10" />
                            </div>
                            <TextHeading size="h3" className="mb-2">
                                No nodes detected
                            </TextHeading>
                            <p className="text-muted-foreground/60 max-w-sm font-normal">
                                Try expanding your search or register a new system endpoint to begin.
                            </p>
                        </div>
                    )}

                    {!loading && filteredTargets.map((target) => {
                        const cfg = STATUS_CONFIG[target.status] || STATUS_CONFIG.unknown;

                        return (
                            <Card
                                key={target.id}
                                onClick={() => router.push(TARGET_ROUTES.target(target.id))}
                                className="cursor-pointer group border border-border/40 bg-background/60 backdrop-blur-sm hover:border-primary/40 transition-all duration-500 rounded-[32px] shadow-sm relative overflow-hidden"
                            >
                                <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 group-hover:scale-110">
                                    <Icons.network className="size-48 rotate-12" />
                                </div>

                                <CardHeader className="p-8 pb-4 relative z-10 font-instrument">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-5 min-w-0">
                                            <div className="size-14 rounded-[22px] bg-muted/40 text-muted-foreground flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 border border-border/5">
                                                <Icons.network className="size-7" />
                                            </div>
                                            <div className="flex flex-col gap-1.5 min-w-0 text-left">
                                                <TextHeading size="h4" className="truncate text-xl">
                                                    {target.name}
                                                </TextHeading>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0 border-none", cfg.variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600')}>
                                                        <div className={cn("size-1.5 rounded-full mr-2", target.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-destructive")} />
                                                        <span className="text-[10px] font-bold lowercase">{target.status}</span>
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground/50 font-semibold truncate leading-none lowercase">
                                                        seen {timeAgo(target.lastHealthCheck)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <Icons.arrowRight className="size-4 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </div>
                                </CardHeader>

                                <CardContent className="px-8 py-2">
                                     <p className="text-sm text-muted-foreground/60 line-clamp-1 font-instrument opacity-60">
                                         {target.description || 'Dedicated system instance for operational processes.'}
                                     </p>
                                </CardContent>

                                <CardFooter className="px-8 py-6 justify-between border-t border-border/5 bg-muted/5 mt-4">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleCheckHealth(target.id); }}
                                            disabled={checkingId === target.id}
                                            className="h-9 px-4 rounded-xl text-muted-foreground border border-transparent hover:border-border/20 hover:bg-background transition-all font-instrument font-semibold"
                                        >
                                            {checkingId === target.id ? <Icons.loading className="size-4 animate-spin mr-2" /> : <Icons.activity className="size-4 mr-2" />}
                                            <span className="text-xs">ping</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(target); }}
                                            className="h-9 px-4 rounded-xl text-muted-foreground border border-transparent hover:border-border/20 hover:bg-background transition-all font-instrument font-semibold"
                                        >
                                            <Icons.pencil className="size-4 mr-2" />
                                            <span className="text-xs">setup</span>
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); handleDelete(target.id); }}
                                        disabled={deletingId === target.id}
                                        className="size-9 rounded-xl text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <Icons.trash className="size-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <TargetFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                onTestConnection={testConnection}
                editingTarget={editingTarget}
                saving={saving}
            />
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={executeDelete}
                title={TARGET_UI_LABELS.confirm.deleteTitle}
                message={TARGET_UI_LABELS.confirm.deleteMessage}
                confirmText={TARGET_UI_LABELS.confirm.deleteConfirm}
                variant="destructive"
                loading={deletingId === confirmDeleteId}
            />
        </div>
    );
}
