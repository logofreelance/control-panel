/**
 * feature-client-api-keys - IntegrationGuide
 *
 * Comprehensive integration guide for AI-friendly frontend development.
 * Pindahkan dari modules/api/registry/code-examples.ts
 */

"use client";

import { Button, Badge, Card, CardContent } from "@/components/ui";
import { TextHeading } from "@/components/ui/text-heading";
import { Icons } from "../config/icons";
import { API_KEYS_LABELS } from "../constants/ui-labels";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { CODE_EXAMPLES, GUIDE_CONTENT } from "../registry/code-examples";
import React from "react";

const L = API_KEYS_LABELS;

interface IntegrationGuideProps {
  copyToClipboard: (text: string, message?: string) => void;
}

// ── Method Badge ──────────────────────────────────
const MethodBadge = ({ method }: { method: string }) => {
  return (
    <span
      className={cn(
        "text-sm font-semibold px-2 py-0.5 rounded-lg lowercase bg-muted text-foreground",
        method === 'GET' && "bg-emerald-500/10 text-emerald-600",
        method === 'POST' && "bg-blue-500/10 text-blue-600",
        method === 'PUT' && "bg-amber-500/10 text-amber-600",
        method === 'DELETE' && "bg-rose-500/10 text-rose-500"
      )}>
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
    <Card className="bg-card">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-8">
          <TextHeading size="h4" className="text-xl flex items-center gap-2 lowercase">
            <Icons.rocket className="size-6 text-primary" />
            {L.sections.integrationGuide}
          </TextHeading>
          <Badge variant="outline" className="lowercase px-3 py-1">
            {L.labels.fullGuide}
          </Badge>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* ━━━━ Left Column: Steps (3/5 width) ━━━━ */}
        <div className="xl:col-span-3 space-y-4">
          {/* ── Step 1: Buat API Key ──────────── */}
          <div className="relative pl-8 border-l-2 border-border/20 pb-4">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-muted flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-muted-foreground" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              1. {G.step1.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed lowercase">
              {G.step1.description}
            </p>
            <div className="text-sm text-amber-600 bg-amber-500/10 p-3 rounded-xl flex items-start gap-3">
              <Icons.alertTriangle className="size-4 shrink-0 mt-0.5" />
              <span className="lowercase">{G.step1.warning}</span>
            </div>
          </div>

          {/* ── Step 2: Add CORS Domain ───────── */}
          <div className="relative pl-8 border-l-2 border-border/20 pb-4">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-muted flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-muted-foreground" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              2. {G.step2.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed lowercase">
              {G.step2.description}
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-foreground mb-2">
              {G.step2.examples.map((ex, i) => (
                <span key={i} className="bg-muted px-2 py-1 rounded-lg lowercase border-none">
                  {ex}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic lowercase">{G.step2.note}</p>
          </div>

          {/* ── Step 3: Base URL ──────────────── */}
          <div className="relative pl-8 border-l-2 border-border/20 pb-4">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-muted flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-muted-foreground" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              3. {G.step3.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed lowercase">
              {G.step3.description}
            </p>
            <div className="flex items-center gap-3 bg-muted p-3 rounded-xl min-w-0">
              <div className="text-sm text-primary truncate flex-1 min-w-0 font-sans">
                {env.API_URL}/green
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`${env.API_URL}/green`, L.messages.urlCopied)}
                className="size-8 p-0 rounded-lg"
              >
                <Icons.copy className="size-4" />
              </Button>
            </div>
          </div>

          {/* ── Step 4: Headers ───────────────── */}
          <div className="relative pl-8 border-l-2 border-border/20 pb-4">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-primary flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-background" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              4. {G.step4.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed lowercase">
              {G.step4.description}
            </p>
            <div className="space-y-3">
              {/* Required Header */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-none lowercase">
                      mandatory
                    </Badge>
                    <p className="text-sm text-muted-foreground lowercase">
                      {G.headers.required.label}
                    </p>
                  </div>
                  <div className="text-base text-foreground font-sans lowercase mb-1">
                    {G.headers.required.value}
                  </div>
                  <p className="text-sm text-muted-foreground lowercase">
                    {G.headers.required.description}
                  </p>
                </CardContent>
              </Card>
              {/* Content-Type Header */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none lowercase">
                      protocol requirement
                    </Badge>
                    <p className="text-sm text-muted-foreground lowercase">
                      {G.headers.contentType.label}
                    </p>
                  </div>
                  <div className="text-base text-foreground font-sans lowercase mb-1">
                    {G.headers.contentType.value}
                  </div>
                  <p className="text-sm text-muted-foreground lowercase">
                    {G.headers.contentType.description}
                  </p>
                </CardContent>
              </Card>
              {/* Optional Header */}
              <Card className="bg-muted/10 border-dashed border-muted">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none lowercase">
                      optional
                    </Badge>
                    <p className="text-sm text-muted-foreground lowercase">
                      {G.headers.optional.label}
                    </p>
                  </div>
                  <div className="text-base text-muted-foreground font-sans lowercase mb-1">
                    {G.headers.optional.value}
                  </div>
                  <p className="text-sm text-muted-foreground lowercase">
                    {G.headers.optional.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Step 5: Auth Flow ─────────────── */}
          <div className="relative pl-8 border-l-2 border-border/20 pb-4">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-primary flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-background" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              5. {G.step5.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed lowercase">
              {G.step5.description}
            </p>

            {/* Auth Flow Visual Steps */}
            <div className="space-y-3 mb-6">
              {G.step5.substeps.map((sub, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground lowercase">
                        {sub.label}
                      </span>
                      {sub.method && sub.path && (
                        <>
                          <MethodBadge method={sub.method} />
                          <div className="text-sm text-muted-foreground lowercase">
                            {sub.path}
                          </div>
                        </>
                      )}
                    </div>
                    {sub.body && (
                      <div className="text-sm text-muted-foreground mt-1 lowercase bg-muted/40 p-2 rounded-lg">
                        {sub.body}
                      </div>
                    )}
                    {sub.note && (
                      <p className="text-sm text-muted-foreground mt-1 lowercase italic">
                        {sub.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Collapsible Auth Routes Table */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection("authRoutes")}
              className="lowercase text-primary p-0 h-auto hover:bg-transparent"
            >
              <Icons.chevronRight
                className={cn("size-4 transition-transform mr-2", expandedSection === "authRoutes" ? "rotate-90" : "")}
              />
              {G.authRoutes.title.toLowerCase()} ({G.authRoutes.routes.length} endpoints)
            </Button>
            {expandedSection === "authRoutes" && (
              <div className="mt-4 border-none bg-muted/20 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground lowercase w-20">
                        {L.labels.method}
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground lowercase">
                        {L.labels.path}
                      </th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground lowercase hidden sm:table-cell w-24">
                        {L.labels.auth}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {G.authRoutes.routes.map((route, i) => (
                      <tr key={i} className="border-t border-border/5">
                        <td className="px-4 py-3">
                          <MethodBadge method={route.method} />
                        </td>
                        <td className="px-4 py-3 text-foreground lowercase font-sans">
                          {route.path}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge variant="outline" className={cn("lowercase border-none", route.auth === "Public" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                            {route.auth}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Step 6: CRUD Pattern ──────────── */}
          <div className="relative pl-8 border-l-2 border-border/20 pb-4">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-primary flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-background" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              6. {G.step6.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed lowercase">
              {G.step6.description}
            </p>
            <div className="bg-muted/20 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-sm">
                <tbody>
                  {G.step6.endpoints.map((ep, i) => (
                    <tr key={i} className="border-t border-border/5">
                      <td className="px-4 py-3 w-20">
                        <MethodBadge method={ep.method} />
                      </td>
                      <td className="px-4 py-3 text-foreground lowercase font-sans">
                        {ep.path}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell lowercase text-right">
                        {ep.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground italic leading-relaxed lowercase">
              <Icons.info className="size-4 inline mr-2 -mt-0.5" />
              {G.step6.note}
            </p>
          </div>

          {/* ── Step 7: Response Format ──────── */}
          <div className="relative pl-8 border-l-2 border-transparent pb-2">
            <div className="absolute -left-[9px] top-1 size-4 rounded-full bg-primary flex items-center justify-center">
              <div className="size-1.5 rounded-full bg-background" />
            </div>
            <TextHeading size="h5" className="text-base mb-1 lowercase">
              7. {G.step7.title}
            </TextHeading>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed lowercase">
              {G.step7.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="text-emerald-600 mb-3 flex items-center gap-2 lowercase font-medium">
                    <Icons.checkCircle className="size-4" /> {L.labels.success}
                  </div>
                  <div className="text-sm text-foreground whitespace-pre leading-relaxed font-sans lowercase">
                    {G.step7.successExample}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="text-rose-500 mb-3 flex items-center gap-2 lowercase font-medium">
                    <Icons.alertTriangle className="size-4" /> {L.labels.error}
                  </div>
                  <div className="text-sm text-foreground whitespace-pre leading-relaxed font-sans lowercase">
                    {G.step7.errorExample}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-4 text-sm text-primary bg-primary/10 p-4 rounded-xl flex items-start gap-3">
              <Icons.info className="size-5 shrink-0 mt-0.5" />
              <span className="lowercase">{G.step7.tip}</span>
            </div>
          </div>
        </div>

        {/* ━━━━ Right Column: Code Examples (2/5 width) ━━━━ */}
        <div className="xl:col-span-2 flex flex-col h-full max-h-[700px] xl:max-h-full bg-foreground rounded-xl overflow-hidden sticky top-4">
          {/* Tab Bar */}
          <div className="flex items-center border-b border-background/5 bg-foreground overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex flex-row items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative shrink-0 lowercase",
                    isActive ? "text-background bg-primary" : "text-background/40 hover:text-background/60 hover:bg-background/5"
                  )}>
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(activeCode, L.messages.codeCopied)}
              className="text-background/60 hover:text-background px-4 hover:bg-background/10 transition-colors"
            >
              <Icons.copy className="size-4" />
            </Button>
          </div>
          {/* Code Content */}
          <div className="p-6 overflow-auto scrollbar-none">
            <div className="text-sm font-sans text-background whitespace-pre-wrap leading-relaxed lowercase">
              {activeCode}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
  );
};
