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
    <div className="space-y-6 pb-20 animate-page-enter">
      {/* Header - Flat Luxury */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn("rounded-lg px-2.5 py-0.5 text-xs font-medium lowercase", methodStyles[endpoint.method] || "bg-muted")}>
                {endpoint.method.toLowerCase()}
              </Badge>
              {endpoint.isActive ? (
                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 rounded-lg text-xs lowercase font-medium border-none">
                  {L.labels?.active || "active"}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground rounded-lg text-xs lowercase font-medium border-none">
                  {L.labels?.inactive || "inactive"}
                </Badge>
              )}
            </div>
            <div className="text-2xl sm:text-3xl text-foreground font-bold bg-muted px-3 py-1 rounded-xl w-fit">
              {endpoint.path}
            </div>
          </div>
          {endpoint.description && (
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed lowercase">
              {endpoint.description}
            </p>
          )}
        </div>
        <div className="flex flex-row items-center gap-3">
          <Button
            variant="outline"
            onClick={() => onBack?.()}
            className="rounded-xl lowercase font-medium"
          >
            <Icons.arrowLeft className="size-4" />
            {L.buttons?.back || "back"}
          </Button>
          <Button
            variant="default"
            onClick={() => onNavigate?.("editor", endpointId)}
            className="rounded-xl lowercase font-medium"
          >
            <Icons.edit className="size-4" />
            {L.buttons?.edit || "edit"}
          </Button>
        </div>
      </div>

      {/* Quick Copy URL - Premium Flat */}
      <Card className="rounded-2xl border-none shadow-none bg-muted">
        <CardContent className="py-4 px-6">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-normal text-muted-foreground mb-0.5 lowercase">
                {L.detail?.fullUrl || "full access url"}
              </p>
              <div className="text-base text-foreground break-all">
                {fullUrl}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(fullUrl, "url")}
              className="rounded-xl hover:bg-background text-muted-foreground hover:text-foreground transition-all"
            >
              {copiedField === "url" ? (
                <Icons.check className="size-4 text-chart-2" />
              ) : (
                <Icons.copy className="size-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Request Info */}
          <Card className="rounded-2xl border-none shadow-none bg-card overflow-hidden">
            <CardContent className="py-5 px-6">
              <div className="flex flex-row items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                  <Icons.send className="size-5 text-chart-1" />
                </div>
                <TextHeading size="h4" className="lowercase text-foreground">
                  {L.detail?.requestInfo || "request information"}
                </TextHeading>
              </div>
              <div className="space-y-4">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-sm text-muted-foreground font-normal lowercase">
                    {L.detail?.method || "method"}
                  </p>
                  <Badge variant="outline" className={cn("rounded-lg px-3 py-1 text-xs font-semibold lowercase", methodStyles[endpoint.method] || "bg-muted")}>
                    {endpoint.method.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <p className="text-sm text-muted-foreground font-normal lowercase">
                    {L.detail?.contentType || "content type"}
                  </p>
                  <span className="text-base text-foreground bg-muted px-2 py-1 rounded-lg">
                    {JSON_CONTENT_TYPE}
                  </span>
                </div>
                {dataSource && (
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground font-normal lowercase">
                      {L.labels?.dataSource || "data source"}
                    </p>
                    <p className="text-base font-normal text-foreground lowercase">
                      {dataSource.name}
                    </p>
                  </div>
                )}
                {resource && (
                  <div className="flex flex-row justify-between items-center">
                    <p className="text-sm text-muted-foreground font-normal lowercase">
                      {L.labels?.resource || "logic resource"}
                    </p>
                    <p className="text-base font-normal text-foreground lowercase">
                      {resource.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="rounded-2xl border-none shadow-none bg-card overflow-hidden">
            <CardContent className="py-5 px-6">
              <div className="flex flex-row items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Icons.lock className="size-5 text-chart-4" />
                </div>
                <TextHeading size="h4" className="lowercase text-foreground">
                  {L.detail?.security || "security & permissions"}
                </TextHeading>
              </div>
              <div className="space-y-6">
                <div className="flex flex-row justify-between items-center">
                  <p className="text-sm text-muted-foreground font-normal lowercase">
                    {L.misc?.accessLevel || "access level"}
                  </p>
                  <p className="text-base font-normal text-foreground lowercase">
                    {getRoleLevelLabel(endpoint.minRoleLevel ?? 0)}
                  </p>
                </div>
                {endpoint.roles && (
                  <div className="space-y-3">
                    <p className="text-sm font-normal text-muted-foreground lowercase">
                      {L.labels?.roles || "authorized roles"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.roles.split(",").map((role: string) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="bg-chart-3/10 text-chart-3 border-none rounded-xl px-3 py-1.5 text-xs font-medium lowercase"
                        >
                          {role.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {endpoint.permissions && (
                  <div className="space-y-3">
                    <p className="text-sm font-normal text-muted-foreground lowercase">
                      {L.labels?.permissions || "required permissions"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {endpoint.permissions.split(",").map((perm: string) => (
                        <Badge
                          key={perm}
                          variant="secondary"
                          className="bg-chart-5/10 text-chart-5 border-none rounded-xl px-3 py-1.5 text-xs font-medium lowercase"
                        >
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
        <div className="space-y-6">
          {/* Code Examples */}
          <Card className="rounded-2xl border-none shadow-none bg-card overflow-hidden">
            <CardContent className="py-5 px-6">
              <div className="flex flex-row items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <Icons.code className="size-5 text-chart-3" />
                </div>
                <TextHeading size="h4" className="lowercase text-foreground">
                  {L.detail?.codeExamples || "implementation examples"}
                </TextHeading>
              </div>

              {/* Tab Buttons */}
              <div className="flex flex-row gap-1 bg-muted p-1 rounded-2xl mb-5">
                {(["curl", "javascript", "python"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={cn(
                      "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all lowercase",
                      activeCodeTab === tab
                        ? "bg-background text-foreground shadow-none"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "curl"
                      ? "curl"
                      : tab === "javascript"
                        ? "javascript"
                        : "python"}
                  </button>
                ))}
              </div>

              {/* Code Block */}
              <div className="relative group">
                <div className="bg-muted rounded-2xl p-5 overflow-hidden">
                  <div className="text-sm text-foreground overflow-x-auto scrollbar-none leading-relaxed whitespace-pre">
                    {codeExamples[activeCodeTab]}
                  </div>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(codeExamples[activeCodeTab], activeCodeTab)
                  }
                  className="absolute top-4 right-4 size-10 flex items-center justify-center bg-background hover:bg-foreground hover:text-background rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-none border-none"
                >
                  {copiedField === activeCodeTab ? (
                    <Icons.check className="size-4 text-chart-2" />
                  ) : (
                    <Icons.copy className="size-4" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Response Template */}
          {endpoint.responseData && (
            <Card className="rounded-2xl border-none shadow-none bg-card overflow-hidden">
              <CardContent className="py-5 px-6">
                <div className="flex flex-row items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                    <Icons.file className="size-5 text-chart-2" />
                  </div>
                  <TextHeading size="h4" className="lowercase text-foreground">
                    {L.detail?.responseTemplate || "json response schema"}
                  </TextHeading>
                </div>
                <div className="bg-muted p-5 rounded-2xl relative group">
                  <div className="text-sm text-foreground overflow-x-auto scrollbar-none leading-relaxed whitespace-pre">
                    {endpoint.responseData}
                  </div>
                  <button
                    onClick={() => copyToClipboard(endpoint.responseData || "", "schema")}
                    className="absolute top-4 right-4 size-10 flex items-center justify-center bg-background hover:bg-foreground hover:text-background rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-none border-none"
                  >
                    {copiedField === "schema" ? (
                      <Icons.check className="size-4 text-chart-2" />
                    ) : (
                      <Icons.copy className="size-4" />
                    )}
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
