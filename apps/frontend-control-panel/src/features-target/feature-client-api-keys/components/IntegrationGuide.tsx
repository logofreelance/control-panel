/**
 * feature-client-api-keys - IntegrationGuide
 *
 * Comprehensive integration guide for AI-friendly frontend development.
 * Pindahkan dari modules/api/registry/code-examples.ts
 */

"use client";

import { Button, Badge, Heading, Text, Stack, Card, CardContent } from "@/components/ui";
import { Icons } from "../config/icons";
import { API_KEYS_LABELS } from "../constants/ui-labels";
import { env } from "@/lib/env";
import { CODE_EXAMPLES, GUIDE_CONTENT } from "../registry/code-examples";
import React from "react";

const L = API_KEYS_LABELS;

interface IntegrationGuideProps {
  copyToClipboard: (text: string, message?: string) => void;
}

// ── Step Indicator Component ──────────────────────
const StepDot = ({ active = false }: { active?: boolean }) => (
  <div
    className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-background ring-1 flex items-center justify-center ${active ? "bg-primary/10 ring-primary/20" : "bg-muted ring-border"}`}>
    <span
      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground"}`}
    />
  </div>
);

// ── Method Badge ──────────────────────────────────
const MethodBadge = ({ method }: { method: string }) => {
  const colors: Record<string, string> = {
    GET: "bg-emerald-50 text-emerald-700 border-emerald-100",
    POST: "bg-blue-50 text-blue-700 border-blue-100",
    PUT: "bg-amber-50 text-amber-700 border-amber-100",
    DELETE: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <span
      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${colors[method] || "bg-muted text-foreground border-border"}`}>
      {method}
    </span>
  );
};

export const IntegrationGuide = ({
  copyToClipboard,
}: IntegrationGuideProps) => {
  const [activeTab, setActiveTab] = React.useState<
    "js" | "flutter" | "reactNative"
  >("js");
  const [expandedSection, setExpandedSection] = React.useState<string | null>(
    null,
  );
  const apiUrl = env.API_URL || "http://localhost:3001";
  const G = GUIDE_CONTENT;

  const tabs = [
    {
      id: "js",
      label: L.labels.websiteJs,
      icon: Icons.globe,
      code: CODE_EXAMPLES.javascript(apiUrl),
    },
    {
      id: "flutter",
      label: L.labels.mobileFlutter,
      icon: Icons.smartphone,
      code: CODE_EXAMPLES.flutter(apiUrl),
    },
    {
      id: "reactNative",
      label: L.labels.mobileReactNative,
      icon: Icons.code,
      code: CODE_EXAMPLES.reactNative(apiUrl),
    },
  ] as const;

  const activeCode = tabs.find(t => t.id === activeTab)?.code || "";

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <Card  className="p-4 sm:p-6">
      {/* Header */}
      <Stack direction="row" align="center" justify="between" className="mb-6">
        <Heading level={4} className="text-lg flex items-center gap-2">
          <Icons.rocket className="w-5 h-5 text-primary" />{" "}
          {L.sections.integrationGuide}
        </Heading>
        <Badge
          variant="default"
          className="font-medium px-3 py-1">
          {L.labels.fullGuide}
        </Badge>
      </Stack>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* ━━━━ Left Column: Steps (3/5 width) ━━━━ */}
        <div className="xl:col-span-3 space-y-1">
          {/* ── Step 1: Buat API Key ──────────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-border pb-5">
            <StepDot />
            <Heading level={4} className="text-sm mb-1">
              {"1. "}
              {G.step1.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-2 leading-relaxed">
              {G.step1.description}
            </Text>
            <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg flex items-start gap-2">
              <Icons.alertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{G.step1.warning}</span>
            </div>
          </div>

          {/* ── Step 2: Add CORS Domain ───────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-border pb-5">
            <StepDot />
            <Heading level={4} className="text-sm mb-1">
              {"2. "}
              {G.step2.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-2 leading-relaxed">
              {G.step2.description}
            </Text>
            <div className="flex flex-wrap gap-2 text-[10px] text-foreground font-mono mb-1">
              {G.step2.examples.map((ex, i) => (
                <span
                  key={i}
                  className="bg-muted border border-border px-1.5 py-0.5 rounded">
                  {ex}
                </span>
              ))}
            </div>
            <Text variant="muted" className="text-[10px] italic">{G.step2.note}</Text>
          </div>

          {/* ── Step 3: Base URL ──────────────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-border pb-5">
            <StepDot />
            <Heading level={4} className="text-sm mb-1">
              {"3. "}
              {G.step3.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-2 leading-relaxed">
              {G.step3.description}
            </Text>
            <div className="flex items-center gap-2 bg-muted border border-border p-2.5 rounded-lg min-w-0">
              <code className="text-xs font-mono text-primary truncate flex-1 min-w-0">
                {env.API_URL}/green
              </code>
              <button
                onClick={() =>
                  copyToClipboard(`${env.API_URL}/green`, L.messages.urlCopied)
                }
                className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                <Icons.copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Step 4: Headers ───────────────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-border pb-5">
            <StepDot active />
            <Heading level={4} className="text-sm mb-1">
              {"4. "}
              {G.step4.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-3 leading-relaxed">
              {G.step4.description}
            </Text>
            <div className="space-y-2">
              {/* Required Header */}
              <Card  >
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                      {"WAJIB"}
                    </span>
                    <Text variant="muted" className="text-[10px]">
                      {G.headers.required.label}
                    </Text>
                  </div>
                  <code className="text-xs text-foreground font-mono block">
                    {G.headers.required.value}
                  </code>
                  <Text variant="muted" className="text-[10px] mt-1">
                    {G.headers.required.description}
                  </Text>
                </CardContent>
              </Card>
              {/* Content-Type Header */}
              <Card  >
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded">
                      {"POST/PUT"}
                    </span>
                    <Text variant="muted" className="text-[10px]">
                      {G.headers.contentType.label}
                    </Text>
                  </div>
                  <code className="text-xs text-foreground font-mono block">
                    {G.headers.contentType.value}
                  </code>
                  <Text variant="muted" className="text-[10px] mt-1">
                    {G.headers.contentType.description}
                  </Text>
                </CardContent>
              </Card>
              {/* Optional Header */}
              <Card   className="border-dashed">
                <CardContent>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold text-blue-500 uppercase bg-blue-50 px-1.5 py-0.5 rounded">
                      {"OPTIONAL"}
                    </span>
                    <Text variant="muted" className="text-[10px]">
                      {G.headers.optional.label}
                    </Text>
                  </div>
                  <code className="text-xs text-muted-foreground font-mono block">
                    {G.headers.optional.value}
                  </code>
                  <Text variant="muted" className="text-[10px] mt-1">
                    {G.headers.optional.description}
                  </Text>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Step 5: Auth Flow ─────────────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-border pb-5">
            <StepDot active />
            <Heading level={4} className="text-sm mb-1">
              {"5. "}
              {G.step5.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-3 leading-relaxed">
              {G.step5.description}
            </Text>

            {/* Auth Flow Visual Steps */}
            <div className="space-y-2 mb-3">
              {G.step5.substeps.map((sub, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-foreground">
                      {sub.label}
                    </span>
                    {sub.method && sub.path && (
                      <span className="ml-1.5">
                        <MethodBadge method={sub.method} />
                        <code className="text-[10px] font-mono text-muted-foreground ml-1">
                          {sub.path}
                        </code>
                      </span>
                    )}
                    {sub.body && (
                      <code className="text-[10px] font-mono text-muted-foreground ml-1">
                        {sub.body}
                      </code>
                    )}
                    {sub.note && (
                      <span className="text-muted-foreground ml-1">
                        {" — "}
                        {sub.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Collapsible Auth Routes Table */}
            <button
              onClick={() => toggleSection("authRoutes")}
              className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
              <Icons.chevronRight
                className={`w-3 h-3 transition-transform ${expandedSection === "authRoutes" ? "rotate-90" : ""}`}
              />
              {G.authRoutes.title}
              {" ("}
              {G.authRoutes.routes.length}
              {" endpoints)"}
            </button>
            {expandedSection === "authRoutes" && (
              <div className="mt-2 border border-border rounded-lg overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-muted text-left">
                      <th className="px-2 py-1.5 font-semibold text-muted-foreground">
                        {L.labels.method}
                      </th>
                      <th className="px-2 py-1.5 font-semibold text-muted-foreground">
                        {L.labels.path}
                      </th>
                      <th className="px-2 py-1.5 font-semibold text-muted-foreground hidden sm:table-cell">
                        {L.labels.auth}
                      </th>
                      <th className="px-2 py-1.5 font-semibold text-muted-foreground hidden md:table-cell">
                        {L.labels.description}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {G.authRoutes.routes.map((route, i) => (
                      <tr
                        key={i}
                        className="border-t border-border hover:bg-muted/50">
                        <td className="px-2 py-1.5">
                          <MethodBadge method={route.method} />
                        </td>
                        <td className="px-2 py-1.5 font-mono text-foreground">
                          {route.path}
                        </td>
                        <td className="px-2 py-1.5 hidden sm:table-cell">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${route.auth === "Public" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                            {route.auth}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground hidden md:table-cell">
                          {route.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Step 6: CRUD Pattern ──────────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-border pb-5">
            <StepDot active />
            <Heading level={4} className="text-sm mb-1">
              {"6. "}
              {G.step6.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-3 leading-relaxed">
              {G.step6.description}
            </Text>
            <div className="border border-border rounded-lg overflow-hidden mb-2">
              <table className="w-full text-[10px]">
                <tbody>
                  {G.step6.endpoints.map((ep, i) => (
                    <tr
                      key={i}
                      className={`${i > 0 ? "border-t border-border" : ""} hover:bg-muted/50`}>
                      <td className="px-2 py-1.5 w-16">
                        <MethodBadge method={ep.method} />
                      </td>
                      <td className="px-2 py-1.5 font-mono text-foreground">
                        {ep.path}
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground hidden sm:table-cell">
                        {ep.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Text variant="muted" className="text-[10px] italic leading-relaxed">
              <Icons.info className="w-3 h-3 inline mr-1 -mt-0.5" />
              {G.step6.note}
            </Text>
          </div>

          {/* ── Step 7: Response Format ──────── */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-transparent pb-2">
            <StepDot active />
            <Heading level={4} className="text-sm mb-1">
              {"7. "}
              {G.step7.title}
            </Heading>
            <Text variant="muted" className="text-xs mb-3 leading-relaxed">
              {G.step7.description}
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Card  >
                <CardContent>
                  <Text variant="detail" className="text-emerald-600 mb-1.5 flex items-center gap-1">
                    <Icons.checkCircle className="w-3 h-3" /> {L.labels.success}
                  </Text>
                  <pre className="text-[10px] font-mono text-foreground whitespace-pre leading-relaxed">
                    {G.step7.successExample}
                  </pre>
                </CardContent>
              </Card>
              <Card  >
                <CardContent>
                  <Text variant="detail" className="text-red-600 mb-1.5 flex items-center gap-1">
                    <Icons.alertTriangle className="w-3 h-3" /> {L.labels.error}
                  </Text>
                  <pre className="text-[10px] font-mono text-foreground whitespace-pre leading-relaxed">
                    {G.step7.errorExample}
                  </pre>
                </CardContent>
              </Card>
            </div>
            <div className="mt-2 text-[10px] text-primary bg-primary/10 border border-primary/20 p-2 rounded-lg flex items-start gap-2">
              <Icons.info className="w-3 h-3 shrink-0 mt-0.5" />
              <span>{G.step7.tip}</span>
            </div>
          </div>
        </div>

        {/* ━━━━ Right Column: Code Examples (2/5 width) ━━━━ */}
        <div className="xl:col-span-2 flex flex-col h-full max-h-[700px] xl:max-h-full bg-foreground rounded-xl overflow-hidden border border-border xl:sticky xl:top-4">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-border bg-foreground/90 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                                         flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-colors border-r border-border relative shrink-0
                                         ${isActive ? "text-background bg-background/10" : "text-background/50 hover:text-background/60 hover:bg-background/10"}
                                     `}>
                  <Icon
                    className={`w-3 h-3 ${isActive ? "text-blue-400" : "opacity-70"}`}
                  />
                  {tab.label}
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              );
            })}
            <div className="flex-1 min-w-[12px]" />
            <button
              onClick={() => copyToClipboard(activeCode, L.messages.codeCopied)}
              className="text-background/60 hover:text-background px-2.5 transition-colors shrink-0"
              title="Copy code">
              <Icons.copy className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Code Content */}
          <div className="flex-1 overflow-auto relative group">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge className="bg-background/10 text-background/50 hover:bg-background/20 hover:text-background cursor-default text-[10px] border-none">
                {tabs.find(t => t.id === activeTab)?.label}
              </Badge>
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-300 leading-relaxed tab-4">
              <code>{activeCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </Card>
  );
};
