"use client";

import { Badge, Button, Input, Modal, Select, Card, CardContent, Heading, Text, Stack } from "@/components/ui";
import { Icons } from "../../../config/icons";
import { DYNAMIC_ROUTES_LABELS } from "../../../constants/ui-labels";
import { ConfirmDialog, useToast } from "@/modules/_core";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useRouteBuilder } from "../composables";

interface RouteBuilderViewProps {
  targetId: string;
  onNavigate?: (view: string, endpointId?: string) => void;
}

const METHOD_STYLES: Record<string, { bg: string; text: string }> = {
  GET: { bg: "bg-blue-500/10", text: "text-blue-600" },
  POST: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  PUT: { bg: "bg-amber-500/10", text: "text-amber-600" },
  DELETE: { bg: "bg-red-500/10", text: "text-red-600" },
  PATCH: { bg: "bg-purple-500/10", text: "text-purple-600" },
};

export const RouteBuilderView = ({
  targetId,
  onNavigate,
}: RouteBuilderViewProps) => {
  const { addToast } = useToast();
	const L = DYNAMIC_ROUTES_LABELS.routeBuilder;

  const {
    loading,
    categories,
    endpoints,
    filteredEndpoints,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedMethod,
    setSelectedMethod,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    categoryForm,
    setCategoryForm,
    isSavingCategory,
    deleteConfirm,
    setDeleteConfirm,
    deleteLoading,
    handleSaveCategory,
    executeDelete,
    handleToggleEndpoint,
    openDeleteConfirm,
  } = useRouteBuilder(targetId);

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(`${env.API_URL}${path}`);
    addToast(L.messages.copiedPath, "success");
  };

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center rounded-xl">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <Stack direction="row" className="flex-col md:flex-row md:items-center justify-between">
        <Stack direction="row" className="gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Icons.rocket className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <Heading level={2} className="text-2xl sm:text-3xl">
              {L.title}
            </Heading>
            <Text className="text-sm text-muted-foreground">{L.subtitle}</Text>
          </div>
        </Stack>
        <Stack direction="row" className="flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm gap-1"
            onClick={() => {
              setEditingCategory(null);
              setCategoryForm({ name: "", description: "" });
              setIsCategoryModalOpen(true);
            }}>
            <Icons.plus className="w-4 h-4" />
            <span className="hidden sm:inline">{L.buttons.newCategory}</span>
            <span className="sm:hidden">{L.labels.categories}</span>
          </Button>
          <Button
            size="sm"
            className="text-xs sm:text-sm gap-1"
            onClick={() => onNavigate?.("editor")}>
            <Icons.plus className="w-4 h-4" />
            <span className="hidden sm:inline">{L.buttons.newEndpoint}</span>
            <span className="sm:hidden">{L.buttons.new}</span>
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <div className="relative min-h-[160px]">
        {loading && <LoadingOverlay />}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            {
              label: L.labels.endpoints,
              value: stats.total,
              Icon: Icons.link,
              bg: "bg-blue-500",
              sub: "Total Routes",
            },
            {
              label: L.labels.active,
              value: stats.active,
              Icon: Icons.checkCircle,
              bg: "bg-emerald-500",
              sub: "Online",
            },
            {
              label: L.labels.categories,
              value: stats.categories,
              Icon: Icons.folder,
              bg: "bg-violet-500",
              sub: "Groups",
            },
            {
              label: L.labels.method,
              value: stats.methods,
              Icon: Icons.branch,
              bg: "bg-amber-500",
              sub: "Types",
            },
          ].map((stat, i) => {
            const StatIcon = stat.Icon;
            return (
              <Card key={i} className={cn("relative overflow-hidden border-0 rounded-2xl", stat.bg)}>
                <CardContent className="relative z-10 p-6 flex flex-col justify-between h-36">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest">
                      {stat.label}
                    </span>
                    <div className="size-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <StatIcon className="size-[18px] text-white" />
                    </div>
                  </div>
                  <div>
                    <Text className="text-3xl font-bold text-white">
                      {stat.value}
                    </Text>
                    <Text className="text-xs text-white/50 mt-0.5">
                      {stat.sub}
                    </Text>
                  </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-white/10" />
                <div className="absolute -top-2 -right-2 size-16 rounded-full bg-white/5" />
              </Card>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative min-h-[76px]">
        {loading && <LoadingOverlay />}
        <Card >
          <CardContent className="p-3 sm:p-4">
            <Stack direction="row" className="flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <div className="flex-1 min-w-0 sm:min-w-[200px] relative">
                <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm"
                />
              </div>
              <Stack direction="row" className="flex-wrap gap-2 w-full sm:w-auto">
                <div className="w-40 sm:w-48 flex-1 sm:flex-none">
                  <Select
                    placeholder={L.labels.allCategories}
                    size="sm"
                    fullWidth={true}
                    value={selectedCategory || ""}
                    onChange={e => setSelectedCategory(e.target.value || null)}
                    options={[
                      { label: L.labels.allCategories, value: "" },
                      ...categories.map(c => ({ label: c.name, value: c.id })),
                    ]}
                  />
                </div>
                <div className="w-28 sm:w-36 flex-1 sm:flex-none">
                  <Select
                    placeholder={L.labels.method}
                    size="sm"
                    fullWidth={true}
                    value={selectedMethod || ""}
                    onChange={e => setSelectedMethod(e.target.value || null)}
                    options={[
                      { label: L.labels.method, value: "" },
                      ...["GET", "POST", "PUT", "DELETE", "PATCH"].map(m => ({
                        label: m,
                        value: m,
                      })),
                    ]}
                  />
                </div>
                {(searchQuery || selectedCategory || selectedMethod) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-9"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setSelectedMethod(null);
                    }}>
                    <Icons.close className="w-3.5 h-3.5" />
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="relative min-h-[400px]">
        {loading && <LoadingOverlay />}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <Heading level={4} className="px-1 flex items-center gap-2 text-xs uppercase opacity-90">
              <Icons.folder className="w-3.5 h-3.5 sm:w-6 sm:h-6 aspect-square" /> {L.labels.categories}
            </Heading>
            <div className="space-y-2">
              {categories.map(cat => {
                const count = endpoints.filter(
                  e => e.categoryId === cat.id,
                ).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(isSelected ? null : cat.id)
                    }
                    className={cn(
                      "p-3 rounded-xl transition-all cursor-pointer group border",
                      isSelected
                        ? "bg-blue-500/10 border-blue-200"
                        : "bg-card border-transparent hover:bg-muted",
                    )}>
                    <Stack direction="row" className="justify-between items-center">
                      <Stack direction="row" className="gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            isSelected ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground",
                          )}>
                          <Icons.folder className="w-3.5 h-3.5 sm:w-6 sm:h-6 aspect-square" />
                        </div>
                        <div>
                          <Heading
                            level={5}
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-blue-600" : "text-foreground",
                            )}>
                            {cat.name}
                          </Heading>
                          <Text className="text-xs! text-muted-foreground">
                            {count} {L.labels.endpoint}
                            {count !== 1 ? "s" : ""}
                          </Text>
                        </div>
                      </Stack>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
                        onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              name: cat.name,
                              description: cat.description || "",
                            });
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-background hover:border-border text-muted-foreground hover:text-foreground">
                          <Icons.pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            openDeleteConfirm("category", cat.id, cat.name)
                          }
                          className="p-1.5 rounded-md hover:bg-background hover:border-border text-muted-foreground hover:text-red-500">
                          <Icons.trash className="w-4 h-4" />
                        </button>
                      </div>
                    </Stack>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div className="text-center p-6 rounded-xl border border-dashed border-border text-muted-foreground text-xs">
                  {L.labels.noCategories}
                </div>
              )}
            </div>
          </div>

          {/* Endpoints List */}
          <div className="lg:col-span-3 space-y-5">
            <Stack direction="row" className="items-center justify-between px-1">
              <Heading level={4} className="flex items-center gap-2 text-xs uppercase opacity-90">
                <Icons.link className="w-3.5 h-3.5 sm:w-6 sm:h-6 aspect-square" /> {L.labels.endpoints}
              </Heading>
              <Badge variant="secondary">
                {filteredEndpoints.length} results
              </Badge>
            </Stack>

            <div className="space-y-3">
              {filteredEndpoints.map((ep, idx) => {
                const methodStyle =
                  METHOD_STYLES[ep.method] || METHOD_STYLES.GET;
                const category = categories.find(c => c.id === ep.categoryId);

                return (
                  <Card
                    
                    key={ep.id}
                    onClick={() => onNavigate?.("detail", ep.id)}
                    className="cursor-pointer animate-in slide-in-from-left-2 duration-300 fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms` }}>
                    <CardContent className="p-5">
                      <Stack direction="row" className="flex-col sm:flex-row sm:items-center gap-4">
                        {/* Method Badge & Path */}
                        <Stack direction="row" className="items-start sm:items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "px-2 py-1 rounded-[6px] text-xs font-semibold shrink-0 w-14 text-center",
                              methodStyle.bg,
                              methodStyle.text,
                            )}>
                            {ep.method}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Stack direction="row" className="items-center gap-2">
                              <Text className="text-xs sm:text-sm font-semibold text-foreground truncate">
                                {ep.path}
                              </Text>
                              {category && (
                                <Badge variant="secondary" className="hidden sm:inline-block text-[10px] px-1.5 py-0.5">
                                  {category.name}
                                </Badge>
                              )}
                            </Stack>
                            <Stack direction="row" className="items-center gap-3 mt-1.5">
                              <Stack direction="row" className="items-center gap-1.5">
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    ep.isActive ? "bg-emerald-500" : "bg-muted-foreground/30",
                                  )} />
                                <Text
                                  className={cn(
                                    "text-xs font-medium",
                                    ep.isActive ? "text-emerald-600" : "text-muted-foreground",
                                  )}>
                                  {ep.isActive ? "Active" : "Inactive"}
                                </Text>
                              </Stack>
                              <span className="text-border text-xs">·</span>
                              <Text className="text-xs text-muted-foreground sm:hidden">
                                {category?.name || "Uncategorized"}
                              </Text>
                              <Text className="text-xs text-muted-foreground font-mono hidden sm:inline-block">
                                RPC
                              </Text>
                            </Stack>
                          </div>
                        </Stack>

                        {/* Actions */}
                        <Stack direction="row" className="items-center justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                          <Stack direction="row" className="gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                copyToClipboard(ep.path);
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy Path">
                              <Icons.copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onNavigate?.(
                                  "tester",
                                  `method=${ep.method}&path=${ep.path}`,
                                );
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Test Endpoint">
                              <Icons.flask className="w-4 h-4" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onNavigate?.("editor", ep.id);
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-colors"
                              title="Edit">
                              <Icons.pencil className="w-4 h-4" />
                            </button>
                            <div className="w-px h-5 bg-border mx-1.5 self-center" />
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleToggleEndpoint(ep.id);
                              }}
                              className={cn(
                                "w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                                ep.isActive ? "text-emerald-500 hover:text-emerald-600" : "text-muted-foreground hover:text-foreground",
                              )}
                              title={ep.isActive ? "Turn Off" : "Turn On"}>
                              <Icons.power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                openDeleteConfirm("endpoint", ep.id, ep.path);
                              }}
                              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-colors"
                              title="Delete">
                              <Icons.trash className="w-4 h-4" />
                            </button>
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredEndpoints.length === 0 && (
                <Card >
                  <CardContent className="text-center p-12">
                    <Icons.search className="w-10 h-10 mx-auto mb-4 opacity-20 text-muted-foreground" />
                    <Text className="font-medium text-foreground text-sm">
                      {endpoints.length === 0
                        ? L.misc?.noEndpointsOne
                        : L.misc?.noEndpointsFilter}
                    </Text>
                    <Text className="text-xs mt-1 text-muted-foreground">
                      {endpoints.length === 0
                        ? L.misc?.noEndpointsTwo
                        : L.misc?.tryAdjusting}
                    </Text>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? "Edit Category" : "New Category"}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {L.labels.name}
            </label>
            <Input
              className="w-full px-4 py-2"
              value={categoryForm.name}
              onChange={e =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              placeholder={L.placeholders.categoryName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {L.labels.description}
            </label>
            <textarea
              className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={categoryForm.description}
              onChange={e =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
              placeholder={L.placeholders.categoryDescription}
              rows={3}
            />
          </div>
          <Stack direction="row" className="justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsCategoryModalOpen(false)}
              disabled={isSavingCategory}>
              {L.buttons.cancel}
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSavingCategory}>
              {isSavingCategory ? "Saving..." : L.buttons.saveCategory}
            </Button>
          </Stack>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={executeDelete}
        title={
          deleteConfirm?.type === "category"
            ? "Delete Category?"
            : "Delete Endpoint?"
        }
        message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
        confirmText={L.buttons.delete}
        cancelText={L.buttons.cancel}
        variant="destructive"
        loading={deleteLoading}
      />
    </div>
  );
};
