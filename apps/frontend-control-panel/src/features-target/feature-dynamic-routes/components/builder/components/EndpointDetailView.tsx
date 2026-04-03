"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Heading,
  Text,
  Stack,
  Button,
  Badge,
} from "@/components/ui";
import { Icons, MODULE_LABELS } from "@/lib/config/client";
import { useEndpointDetail } from "../composables/useEndpointDetail";

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
        <Icons.warning className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <Text className="text-muted-foreground">{L.misc?.noEndpointsOne}</Text>
      </div>
    );
  }

  const fullUrl = getFullUrl();
  const codeExamples = getCodeExamples();
  const methodColors: Record<string, string> = {
    GET: "bg-blue-500/10 text-blue-600",
    POST: "bg-emerald-500/10 text-emerald-600",
    PUT: "bg-amber-500/10 text-amber-600",
    PATCH: "bg-purple-500/10 text-purple-600",
    DELETE: "bg-red-500/10 text-red-600",
  };

  const getRoleLevelLabel = (level: number) => {
    if (level === 0) return L.options?.public || "Public";
    if (level < 50) return L.options?.login || "Login Required";
    if (level < 90) return L.options?.moderator || "Moderator";
    return L.options?.admin || "Admin Only";
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <Stack className="flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full">
          <Stack className="items-start mb-2 flex flex-col justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
            <Badge className={methodColors[endpoint.method]}>
              {endpoint.method}
            </Badge>
            {endpoint.isActive ? (
              <Badge className="bg-emerald-500/10 text-emerald-600">
                {L.labels?.active}
              </Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground">
                {L.labels?.inactive}
              </Badge>
            )}
            </div>

            <code className="text-lg text-foreground font-semibold">
              {endpoint.path}
            </code>
            
          </Stack>
          {endpoint.description && (
            <Text className="text-sm text-muted-foreground max-w-2xl">
              {endpoint.description}
            </Text>
          )}
        </div>
        <Stack className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBack?.()}
            className="text-xs">
            <Icons.arrowLeft className="w-3.5 h-3.5 mr-1" /> {L.buttons?.back}
          </Button>
          <Button
            size="default"
            onClick={() => onNavigate?.("editor", endpointId)}
            className="text-xs">
            <Icons.edit className="w-3.5 h-3.5 mr-1" /> {L.buttons?.edit}
          </Button>
        </Stack>
      </Stack>

      {/* Quick Copy URL */}
      <Card  className="border-dashed border-4 border-slate-300/40">
        <CardContent className="p-4">
          <Stack className="items-center flex-row justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Text className="text-xs font-medium text-muted-foreground mb-1 uppercase">
                {L.detail?.fullUrl}
              </Text>
              <code className="text-xs sm:text-sm text-foreground break-all">
                {fullUrl}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(fullUrl, "url")}
              className="shrink-0 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
              {copiedField === "url" ? (
                <Icons.check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Icons.copy className="w-5 h-5" />
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Request Info */}
          <Card >
            <CardContent className="p-5">
              <Stack className="flex-row items-center gap-2 mb-4 ">
                <Icons.send className="w-5 h-5 text-primary" />
                <Heading level={5} className="font-semibold text-foreground text-sm">
                  {L.detail?.requestInfo}
                </Heading>
              </Stack>
              <div className="space-y-3">
                <Stack className="flex-row justify-between items-center text-sm">
                  <Text className="text-xs text-muted-foreground font-medium">
                    {L.detail?.method}
                  </Text>
                  <Badge className={methodColors[endpoint.method]}>
                    {endpoint.method}
                  </Badge>
                </Stack>
                <Stack className="flex-row justify-between items-center text-sm">
                  <Text className="text-xs text-muted-foreground font-medium">
                    {L.detail?.contentType}
                  </Text>
                  <span className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">
                    {JSON_CONTENT_TYPE}
                  </span>
                </Stack>
                {dataSource && (
                  <Stack className="flex-row justify-between items-center text-sm">
                    <Text className="text-xs text-muted-foreground font-medium">
                      {L.labels?.dataSource}
                    </Text>
                    <Text className="text-sm font-medium text-foreground">
                      {dataSource.name}
                    </Text>
                  </Stack>
                )}
                {resource && (
                  <Stack className="flex-row justify-between items-center text-sm">
                    <Text className="text-xs text-muted-foreground font-medium">
                      {L.labels?.resource}
                    </Text>
                    <Text className="text-sm font-medium text-foreground">
                      {resource.name}
                    </Text>
                  </Stack>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card >
            <CardContent className="p-5">
              <Stack className="flex-row items-center gap-2 mb-4">
                <Icons.lock className="w-5 h-5 text-primary" />
                <Heading level={4} className="font-semibold text-foreground text-sm">
                  {L.detail?.security}
                </Heading>
              </Stack>
              <div className="space-y-5">
                <Stack className="flex-row justify-between items-center text-sm">
                  <Text className="text-xs text-muted-foreground font-medium">
                    {L.misc?.accessLevel}
                  </Text>
                  <Text className="text-sm font-medium text-foreground border-b border-dotted border-border">
                    {getRoleLevelLabel(endpoint.minRoleLevel ?? 0)}
                  </Text>
                </Stack>
                {endpoint.roles && (
                  <div className="text-sm">
                    <Text className="text-xs text-muted-foreground font-medium block mb-2">
                      {L.labels?.roles}
                    </Text>
                    <Stack className="flex-wrap gap-1.5">
                      {endpoint.roles.split(",").map((role: string) => (
                        <Badge
                          key={role}
                          className="bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {role.trim()}
                        </Badge>
                      ))}
                    </Stack>
                  </div>
                )}
                {endpoint.permissions && (
                  <div className="text-sm">
                    <Text className="text-xs text-muted-foreground font-medium block mb-2">
                      {L.labels?.permissions}
                    </Text>
                    <Stack className="flex-wrap gap-1.5">
                      {endpoint.permissions.split(",").map((perm: string) => (
                        <Badge
                          key={perm}
                          className="bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {perm.trim()}
                        </Badge>
                      ))}
                    </Stack>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Responses */}
          <Card >
            <CardContent className="p-5">
              <Stack className="flex-row items-center gap-2 mb-2">
                <Icons.warning className="w-5 h-5 text-primary" />
                <Heading level={4} className="font-semibold text-foreground text-sm">
                  {L.detail?.errorResponses}
                </Heading>
              </Stack>
              <Text className="text-xs! text-muted-foreground mb-4">
                {L.detail?.errorResponsesHint}
              </Text>
              <div className="space-y-2">
                {[
                  {
                    code: 401,
                    suffix: "UNAUTHORIZED",
                    color: "amber",
                    msg: "Authentication required",
                  },
                  {
                    code: 403,
                    suffix: "FORBIDDEN",
                    color: "orange",
                    msg: "Access denied",
                  },
                  {
                    code: 404,
                    suffix: "NOT_FOUND",
                    color: "slate",
                    msg: "Resource not found",
                  },
                  {
                    code: 500,
                    suffix: "SERVER_ERROR",
                    color: "red",
                    msg: "Server error",
                  },
                ].map(err => {
                  const pathSlug =
                    endpoint.path
                      .replace(/^\//, "")
                      .replace(/:[^/]+/g, "")
                      .replace(/\//g, "_")
                      .replace(/_+/g, "_")
                      .replace(/_+$/, "")
                      .toUpperCase() || "ENDPOINT";
                  const errorCode = `${pathSlug}_${err.suffix}`;
                  return (
                    <Stack
                      key={err.code}
                      className="flex-col items-start justify-between p-2.5 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <Stack className="flex-row items-center gap-0">
                        <span
                          className={`px-1.5 py-0.5 text-xs font-semibold rounded bg-${err.color}-100 text-${err.color}-700 min-w-[32px] text-center`}>
                          {err.code}
                        </span>
                        <code className="text-xs font-mono text-foreground py-0.5">
                          {errorCode}
                        </code>
                      </Stack>
                      <Text className="text-xs! text-muted-foreground italic">{err.msg}</Text>
                    </Stack>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Mutation Config - Only for write operations */}
          {["POST", "PUT", "PATCH", "DELETE"].includes(endpoint.method) && (
            <Card >
              <CardContent className="p-5">
                <Stack className="flex-row items-center gap-2 mb-4">
                  <Icons.edit className="w-4 h-4 text-purple-500" />
                  <Heading level={4} className="font-semibold text-foreground text-sm">
                    {L.mutation?.title}
                  </Heading>
                </Stack>
                <div className="space-y-5">
                  {writableFields.length > 0 && (
                    <div>
                      <Text className="text-xs text-muted-foreground font-medium mb-2">
                        {L.mutation?.writableFields}
                      </Text>
                      <Stack className="flex-wrap gap-1.5">
                        {writableFields.map(f => (
                          <Badge
                            key={f}
                            className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-mono">
                            {f}
                          </Badge>
                        ))}
                      </Stack>
                    </div>
                  )}
                  {protectedFields.length > 0 && (
                    <div>
                      <Text className="text-xs text-muted-foreground font-medium mb-2">
                        {L.mutation?.protectedFields}
                      </Text>
                      <Stack className="flex-wrap gap-1.5">
                        {protectedFields.map(f => (
                          <Badge
                            key={f}
                            className="bg-red-500/10 text-red-600 border border-red-500/20 font-mono">
                            {f}
                          </Badge>
                        ))}
                      </Stack>
                    </div>
                  )}
                  {Object.keys(autoPopulateFields).length > 0 && (
                    <div>
                      <Text className="text-xs text-muted-foreground font-medium mb-2">
                        {L.mutation?.autoPopulate}
                      </Text>
                      <div className="space-y-1.5">
                        {Object.entries(autoPopulateFields).map(([key, val]) => (
                          <Stack key={key} className="items-center gap-2 text-xs">
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded font-mono">
                              {key}
                            </span>
                            <Icons.arrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="px-1.5 py-0.5 bg-muted text-foreground rounded font-mono">
                              {val}
                            </span>
                          </Stack>
                        ))}
                      </div>
                    </div>
                  )}
                  {endpoint.ownershipColumn && (
                    <Stack className="justify-between items-center text-sm pt-2 border-t border-border">
                      <Text className="text-xs text-muted-foreground font-medium">
                        {L.mutation?.ownershipColumn}
                      </Text>
                      <span className="font-mono text-xs text-foreground bg-muted px-2 py-1 rounded">
                        {endpoint.ownershipColumn}
                      </span>
                    </Stack>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Code Examples */}
        <div className="space-y-8">
          <Card >
            <CardContent className="p-5">
              <Stack className="flex-row items-center gap-2 mb-4">
                <Icons.code className="w-5 h-5 text-primary" />
                <Heading level={4} className="font-semibold text-foreground text-sm">
                  {L.detail?.codeExamples}
                </Heading>
              </Stack>

              {/* Tab Buttons */}
              <Stack className="flex-row gap-1 mb-4 bg-muted p-1 rounded-lg">
                {(["curl", "javascript", "python"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeCodeTab === tab
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                    {tab === "curl"
                      ? "cURL"
                      : tab === "javascript"
                        ? "JavaScript"
                        : "Python"}
                  </button>
                ))}
              </Stack>

              {/* Code Block */}
              <div className="relative group">
                <pre className="bg-foreground text-slate-300 p-4 rounded-xl text-xs sm:text-xs overflow-x-auto font-mono leading-relaxed border border-border">
                  {codeExamples[activeCodeTab]}
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(codeExamples[activeCodeTab], activeCodeTab)
                  }
                  className="absolute top-3 right-3 p-1.5 bg-background/10 hover:bg-background/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  {copiedField === activeCodeTab ? (
                    <Icons.check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Icons.copy className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Response Template */}
          {endpoint.responseData && (
            <Card >
              <CardContent className="p-5">
                <Stack className="items-center gap-2 mb-4">
                  <Icons.file className="w-4 h-4 text-indigo-500" />
                  <Heading level={4} className="font-semibold text-foreground text-sm">
                    {L.detail?.responseTemplate}
                  </Heading>
                </Stack>
                <pre className="bg-muted border border-border p-4 rounded-xl text-xs sm:text-xs overflow-x-auto font-mono text-foreground leading-relaxed">
                  {endpoint.responseData}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
