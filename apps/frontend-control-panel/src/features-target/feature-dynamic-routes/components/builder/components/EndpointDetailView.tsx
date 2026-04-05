"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import { TextHeading } from "@/components/ui/text-heading";
import { Icons, MODULE_LABELS } from "@/lib/config/client";
import { useEndpointDetail } from "../composables/useEndpointDetail";
import { cn } from "@/lib/utils";

const JSON_CONTENT_TYPE = "application/json";

interface EndpointDetailViewProps {
  targetId: string;
  endpointId: string;
  onNavigate?: (view: string, endpointId?: string) => void;
  onBack?: () => void;
}

export const EndpointDetailView = ({
  targetId,
  endpointId,
  onNavigate,
  onBack,
}: EndpointDetailViewProps) => {
  const L = MODULE_LABELS.routeBuilder;
  const {
    loading,
    endpoint,
    dataSource,
    resource,
    getFullUrl,
    getCodeExamples,
  } = useEndpointDetail(targetId, endpointId);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<
    "curl" | "javascript" | "python"
  >("curl");

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) return null;

  if (!endpoint) {
    return (
      <div className="text-center py-20">
        <div className="size-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icons.warning className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground/60 lowercase">{L.misc?.noEndpointsOne || "endpoint not found"}</p>
      </div>
    );
  }

  const fullUrl = getFullUrl();
  const codeExamples = getCodeExamples();
  const methodStyles: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-600",
    POST: "bg-emerald-500/10 text-emerald-600",
    PUT: "bg-amber-500/10 text-amber-600",
    PATCH: "bg-purple-500/10 text-purple-600",
    DELETE: "bg-red-500/10 text-red-600",
  };

  const getRoleLevelLabel = (level: number) => {
    if (level === 0) return L.options?.public || "public";
    if (level < 50) return L.options?.login || "login required";
    if (level < 90) return L.options?.moderator || "moderator";
    return L.options?.admin || "admin only";
  };

  const parseJsonArray = (str?: string): string[] => {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const parseJsonObject = (str?: string): Record<string, string> => {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  };

  const writableFields = parseJsonArray(endpoint.writableFields);
  const protectedFields = parseJsonArray(endpoint.protectedFields);
  const autoPopulateFields = parseJsonObject(endpoint.autoPopulateFields);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", methodStyles[endpoint.method] || "bg-muted")}>
                {endpoint.method}
              </Badge>
              {endpoint.isActive ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] lowercase font-medium">
                  {L.labels?.active || "active"}
                </Badge>
              ) : (
                <Badge className="bg-muted text-muted-foreground/40 rounded-lg text-[10px] lowercase font-medium">
                  {L.labels?.inactive || "inactive"}
                </Badge>
              )}
            </div>
            <code className="text-xl sm:text-2xl text-foreground font-bold tracking-tight bg-muted/40 px-3 py-1 rounded-xl w-fit">
              {endpoint.path}
            </code>
          </div>
          {endpoint.description && (
            <p className="text-sm text-muted-foreground/60 max-w-2xl leading-relaxed lowercase">
              {endpoint.description}
            </p>
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBack?.()}
            className="text-xs rounded-xl lowercase h-10 px-4">
            <Icons.arrowLeft className="w-3.5 h-3.5 mr-2" /> {L.buttons?.back || "back"}
          </Button>
          <Button
            size="sm"
            onClick={() => onNavigate?.("editor", endpointId)}
            className="text-xs rounded-xl lowercase h-10 px-4">
            <Icons.edit className="w-3.5 h-3.5 mr-2" /> {L.buttons?.edit || "edit"}
          </Button>
        </div>
      </div>

      {/* Quick Copy URL */}
      <Card className="rounded-3xl border-2 border-dashed border-border/20 shadow-none bg-muted/10">
        <CardContent className="p-5">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground/40 mb-1 uppercase tracking-widest">
                {L.detail?.fullUrl || "full access url"}
              </p>
              <code className="text-xs sm:text-sm text-foreground/80 break-all font-mono">
                {fullUrl}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(fullUrl, "url")}
              className="shrink-0 w-10 h-10 rounded-xl hover:bg-background text-muted-foreground/40 hover:text-foreground transition-all">
              {copiedField === "url" ? (
                <Icons.check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Icons.copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Request Info */}
          <Card className="rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-row items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icons.send className="w-4 h-4 text-primary" />
                </div>
                <TextHeading size="h6" weight="semibold" className="text-sm lowercase">
                  {L.detail?.requestInfo || "request information"}
                </TextHeading>
              </div>
              <div className="space-y-4">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xs text-muted-foreground/40 font-medium lowercase">
                    {L.detail?.method || "method"}
                  </p>
                  <Badge className={cn("rounded-lg px-2 py-0.5 text-[10px] font-bold", methodStyles[endpoint.method] || "bg-muted")}>
                    {endpoint.method}
                  </Badge>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xs text-muted-foreground/40 font-medium lowercase">
                    {L.detail?.contentType || "content type"}
                  </p>
                  <span className="font-mono text-[10px] text-foreground bg-muted/50 px-2 py-0.5 rounded-lg">
                    {JSON_CONTENT_TYPE}
                  </span>
                </div>
                {dataSource && (
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-xs text-muted-foreground/40 font-medium lowercase">
                      {L.labels?.dataSource || "data source"}
                    </p>
                    <p className="text-sm font-semibold text-foreground/80 lowercase">
                      {dataSource.name}
                    </p>
                  </div>
                )}
                {resource && (
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-xs text-muted-foreground/40 font-medium lowercase">
                      {L.labels?.resource || "logic resource"}
                    </p>
                    <p className="text-sm font-semibold text-foreground/80 lowercase">
                      {resource.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-row items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icons.lock className="w-4 h-4 text-orange-500" />
                </div>
                <TextHeading size="h6" weight="semibold" className="text-sm lowercase">
                  {L.detail?.security || "security & permissions"}
                </TextHeading>
              </div>
              <div className="space-y-6">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-xs text-muted-foreground/40 font-medium lowercase">
                    {L.misc?.accessLevel || "access level"}
                  </p>
                  <p className="text-sm font-semibold text-foreground/80 lowercase decoration-dotted underline decoration-border/40 underline-offset-4">
                    {getRoleLevelLabel(endpoint.minRoleLevel ?? 0)}
                  </p>
                </div>
                {endpoint.roles && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/40 mb-3 uppercase tracking-widest">
                      {L.labels?.roles || "authorized roles"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {endpoint.roles.split(",").map((role: string) => (
                        <Badge
                          key={role}
                          className="bg-blue-500/5 text-blue-600 border-2 border-blue-500/10 rounded-xl px-3 py-1 text-[10px] font-medium lowercase">
                          {role.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {endpoint.permissions && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/40 mb-3 uppercase tracking-widest">
                      {L.labels?.permissions || "required permissions"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {endpoint.permissions.split(",").map((perm: string) => (
                        <Badge
                          key={perm}
                          className="bg-amber-500/5 text-amber-600 border-2 border-amber-500/10 rounded-xl px-3 py-1 text-[10px] font-medium lowercase">
                          {perm.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Code Examples */}
          <Card className="rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-row items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Icons.code className="w-4 h-4 text-violet-500" />
                </div>
                <TextHeading size="h6" weight="semibold" className="text-sm lowercase">
                  {L.detail?.codeExamples || "implementation examples"}
                </TextHeading>
              </div>

              {/* Tab Buttons */}
              <div className="flex flex-row gap-1.5 mb-5 bg-muted/40 p-1 rounded-2xl">
                {(["curl", "javascript", "python"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-xl text-[10px] font-bold transition-all lowercase tracking-wide",
                      activeCodeTab === tab
                        ? "bg-background text-foreground shadow-none"
                        : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/30"
                    )}>
                    {tab === "curl"
                      ? "cURL"
                      : tab === "javascript"
                        ? "JavaScript"
                        : "Python"}
                  </button>
                ))}
              </div>

              {/* Code Block */}
              <div className="relative group">
                <div className="bg-background rounded-2xl border-2 border-border/10 p-5 overflow-hidden">
                  <pre className="text-[11px] text-foreground/70 overflow-x-auto font-mono scrollbar-none leading-relaxed">
                    {codeExamples[activeCodeTab]}
                  </pre>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(codeExamples[activeCodeTab], activeCodeTab)
                  }
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-muted/50 hover:bg-foreground hover:text-background rounded-xl transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                  {copiedField === activeCodeTab ? (
                    <Icons.check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Icons.copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Response Template */}
          {endpoint.responseData && (
            <Card className="rounded-3xl border-2 border-foreground/5 shadow-none overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-row items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Icons.file className="w-4 h-4 text-emerald-500" />
                  </div>
                  <TextHeading size="h6" weight="semibold" className="text-sm lowercase">
                    {L.detail?.responseTemplate || "json response schema"}
                  </TextHeading>
                </div>
                <div className="bg-muted/30 border-2 border-border/5 p-5 rounded-2xl relative group">
                  <pre className="text-[11px] text-foreground/60 overflow-x-auto font-mono scrollbar-none leading-relaxed">
                    {endpoint.responseData}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(endpoint.responseData || "", "schema")}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-background/50 hover:bg-foreground hover:text-background rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Icons.copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
