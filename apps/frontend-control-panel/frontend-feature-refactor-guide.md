# Frontend Feature Refactor Guide

> Guide untuk merapikan `features-internal/*` agar setiap feature punya config, constants, types, i18n, services, dan hooks yang berdiri sendiri. Minimalisir hardcode di komponen.

**Canonical Example**: `feature-dashboard-main` — sudah fully refactored, gunakan sebagai reference.

---

## 1. Struktur Target

Setiap feature `features-internal/feature-{name}` harus punya struktur ini:

```
feature-{name}/
├── components/
│   └── {Name}View.tsx          ← pure rendering, NO business logic
├── config/
│   ├── icons.ts                ← icon mapping lokal (dari lucide-react)
│   └── routes.ts               ← semua route paths
├── constants/
│   └── ui-labels.ts            ← UI strings + config/magic numbers
├── hooks/
│   └── use{Name}.ts            ← state management, side effects, orchestrator
├── i18n/
│   └── id.ts                   ← Bahasa Indonesia translations
├── services/
│   └── {name}-{domain}.ts      ← pure functions, no React dependency
├── types/
│   └── {name}.ts               ← TypeScript interfaces
└── index.ts                    ← barrel exports semua modul
```

---

## 2. Apa yang Diekstrak

### 2a. `config/routes.ts`

**Apa**: Semua hardcoded route paths dalam component.

**Pattern**:
```typescript
export const {FEATURE}_ROUTES = {
  login: '/login',
  settings: '/settings',
  profile: '/settings/profile',
  target: (id: string) => `/target/${id}`,  // dynamic routes sebagai function
} as const;
```

**Cari di component**:
- `href="/..."` → pindah ke routes
- `window.location.href = '...'` → pindah ke routes
- `<Link href={...}>` → gunakan routes constant

---

### 2b. `constants/ui-labels.ts`

**Apa**: Semua string yang ditampilkan ke user + magic numbers.

**Pattern**:
```typescript
export const UI_LABELS = {
  section: {
    title: 'Title Here',
    empty: 'Empty State Message',
    formatter: (count: number) => `${count} Items`,  // dynamic strings sebagai function
  },
} as const;

export const {FEATURE}_CONFIG = {
  someLimit: 10,
  idSliceLength: 12,
} as const;
```

**Cari di component**:
- Teks di dalam `<span>`, `<Text>`, `<p>`, `<h1>` dll → pindah ke UI_LABELS
- Placeholder text → pindah ke UI_LABELS
- Badge label text → pindah ke UI_LABELS
- Angka magic seperti `slice(0, 10)`, `slice(0, 12)` → pindah ke CONFIG

---

### 2c. `config/icons.ts`

**Apa**: Icon mapping lokal untuk feature. Import langsung dari `lucide-react`, BUKAN dari `@/lib/config/client`.

**Pattern**:
```typescript
import { Loader2, ChevronLeft, User, KeyRound, LogOut } from 'lucide-react';

export const Icons = {
    loading: Loader2,
    chevronLeft: ChevronLeft,
    user: User,
    key: KeyRound,
    logout: LogOut,
} as const;
```

**Cari di component**:
- `import { Icons } from '@/lib/config/client'` → ganti dengan `import { Icons } from '../config/icons'`
- Cari semua `Icons.xxx` yang dipakai → tambahkan ke `config/icons.ts`
- Import icon component langsung dari `lucide-react`, bukan dari centralized registry

**Kenapa**: Feature harus berdiri sendiri. Tidak bergantung pada `@/lib/config/client` untuk icons.

---

### 2d. `types/{name}.ts`

**Apa**: Interface yang spesifik untuk feature ini (bukan dari feature lain).

**Pattern**:
```typescript
export interface {Feature}{Domain}Display {
  id: string;
  name: string;
  // field yang dipakai untuk display, bukan full API response
}
```

**Cari di component**:
- Inline type definitions
- `interface` atau `type` yang didefinisikan di dalam file component

---

### 2e. `i18n/id.ts`

**Apa**: Mirror exact dari `ui-labels.ts` tapi dalam Bahasa Indonesia.

**Pattern**:
```typescript
// Struktur PERSIS sama dengan UI_LABELS, hanya value-nya Bahasa Indonesia
export const {FEATURE}_ID = {
  section: {
    title: 'Judul Di Sini',
    empty: 'Pesan Kosong',
    formatter: (count: number) => `${count} Item`,
  },
} as const;
```

**Cara switch bahasa**: Ubah import di component dari `UI_LABELS` ke `{FEATURE}_ID`.

---

### 2f. `services/{name}-{domain}.ts`

**Apa**: Pure functions untuk business logic. TIDAK boleh import React hooks.

**Pattern**:
```typescript
import type { SomeType } from '@/features-internal/feature-xxx/types/xxx.types';

export function filterItems(items: SomeType[], query: string): SomeType[] {
  // pure logic, no React
}

export function countByStatus(items: SomeType[], status: string): number {
  // pure logic
}
```

**Cari di component**:
- `useMemo` yang menghitung data (filter, slice, count, sort) → pindah ke service
- Inline filtering/sorting logic → pindah ke service
- Format functions (truncate, capitalize, dll) → pindah ke service

---

### 2g. `hooks/use{Name}.ts`

**Apa**: Custom hook yang menggabungkan state, effects, dan service calls. Component hanya memanggil hook ini.

**Pattern**:
```typescript
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// Import hook dari feature lain untuk data
import { useSomeOtherFeature } from '@/features-internal/feature-xxx';
// Import service untuk computation
import { filterItems, countByStatus } from '../services/xxx-domain';
// Import config untuk magic numbers
import { XXX_CONFIG } from '../constants/ui-labels';
// Import routes untuk navigasi
import { XXX_ROUTES } from '../config/routes';

export function use{Name}() {
  // 1. Data dari feature lain
  const { items, loading, addItem, saving } = useSomeOtherFeature();

  // 2. Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 3. Refs
  const searchRef = useRef<HTMLDivElement>(null);

  // 4. Effects (click outside, listeners)
  useEffect(() => { ... }, []);

  // 5. Actions (logout, submit, dll)
  const handleLogout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    window.location.href = XXX_ROUTES.login;
  }, []);

  // 6. Computed values via service
  const filteredItems = useMemo(
    () => filterItems(items, searchQuery),
    [items, searchQuery]
  );

  // 7. Return everything component needs
  return {
    items,
    loading,
    saving,
    addItem,
    searchQuery,
    setSearchQuery,
    filteredItems,
    showModal,
    setShowModal,
    handleLogout,
  };
}
```

**Yang HARUS dipindahkan ke hook**:
- Semua `useState`
- Semua `useRef`
- Semua `useEffect`
- Semua `useCallback` (actions)
- Semua `useMemo` yang memanggil service

**Yang TIDAK dipindahkan**:
- `TargetFormModal` atau modal components tetap di component (mereka rendering)
- JSX-specific logic tetap di component

---

## 3. Cara Refactor Step-by-Step

Ikuti urutan ini. Jangan skip step.

### Step 1: Scan Component

Baca component file, catat semua hardcoded values:

```
STRING HARDCODED:
  - "Some Text" → line XX
  - "Another Text" → line YY

ROUTE HARDCODED:
  - '/some/path' → line ZZ

MAGIC NUMBER:
  - slice(0, 10) → line AA
  - slice(0, 12) → line BB

BUSINESS LOGIC (useMemo/useEffect):
  - filtering logic → line CC
  - counting logic → line DD
  - logout handler → line EE
```

### Step 2: Create Directories

```bash
mkdir -p src/features-internal/feature-{name}/config
mkdir -p src/features-internal/feature-{name}/constants
mkdir -p src/features-internal/feature-{name}/types
mkdir -p src/features-internal/feature-{name}/i18n
mkdir -p src/features-internal/feature-{name}/services
mkdir -p src/features-internal/feature-{name}/hooks
```

### Step 3: Scan Icons

Cari semua `Icons.xxx` di component. Buat `config/icons.ts`:

```typescript
import { IconA, IconB, IconC } from 'lucide-react';

export const Icons = {
    iconA: IconA,
    iconB: IconB,
    iconC: IconC,
} as const;
```

Lalu ganti `import { Icons } from '@/lib/config/client'` menjadi `import { Icons } from '../config/icons'`.

### Step 4: Create `types/{name}.ts`

Dari type definitions yang ada di component atau yang spesifik untuk feature.

### Step 5: Create `config/routes.ts`

Dari route strings yang di-scan di Step 1.

### Step 6: Create `constants/ui-labels.ts`

Dari string + magic numbers yang di-scan di Step 1. Group by section (nav, hero, stats, dll).

### Step 7: Create `i18n/id.ts`

Copy struktur exact dari `ui-labels.ts`, translate values ke Bahasa Indonesia.

### Step 8: Create `services/{name}-{domain}.ts`

Dari `useMemo` yang pure computation (filter, count, sort, format). Ekstrak sebagai pure functions.

### Step 9: Create `hooks/use{Name}.ts`

Gabungkan: `useState` + `useEffect` + `useRef` + `useCallback` + service calls dari component.

### Step 10: Refactor Component

```diff
- import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
- import { authApi } from '@/features-internal/feature-auth';
- import { LABELS } from '@/lib/config/client';
- import { Icons } from '@/lib/config/client';
+ import { use{Name} } from '../hooks/use{Name}';
+ import { UI_LABELS } from '../constants/ui-labels';
+ import { {FEATURE}_ROUTES } from '../config/routes';
+ import { Icons } from '../config/icons';

  export function {Name}View() {
-   const [searchQuery, setSearchQuery] = useState('');
-   const { targets, loading } = useTargetRegistry();
-   // ... 30 lines of state/logic
+   const { searchQuery, setSearchQuery, filteredTargets, loading, handleLogout } = use{Name}();

    return ( ... );  // only JSX, uses UI_LABELS, ROUTES, Icons from feature
  }
```

### Step 11: Update `index.ts`

Tambah exports untuk modul baru:
```typescript
export * from './hooks/use{Name}';
export * from './services/{name}-{domain}';
export * from './constants/ui-labels';
export * from './config/routes';
export * from './types/{name}';
export * from './i18n/id';
```

---

## 4. Contoh Reference

### 4a. `feature-dashboard-main`

| Modul | File | Lines |
|---|---|---|
| Types | `types/dashboard.ts` | 11 |
| Routes | `config/routes.ts` | 7 |
| UI Labels + Config | `constants/ui-labels.ts` | 34 |
| i18n | `i18n/id.ts` | 29 |
| Service | `services/dashboard-stats.ts` | 22 |
| Hook | `hooks/useDashboard.ts` | 70 |
| Component | `components/MainDashboardView.tsx` | 205 (sebelumnya 305) |

Path: `src/features-internal/feature-dashboard-main/`

### 4b. `feature-auth` (fully self-contained)

| Modul | File | Lines |
|---|---|---|
| Types | `types/auth.ts` | 22 |
| Routes | `config/routes.ts` | 5 |
| Icons | `config/icons.ts` | 10 |
| UI Labels | `constants/ui-labels.ts` | 49 |
| i18n | `i18n/id.ts` | 49 |
| Service | `services/auth-validation.ts` | 4 |
| Hook (login) | `hooks/useAuth.ts` | 34 |
| Hook (settings) | `hooks/useUserSettings.ts` | 95 |
| Component | `components/LoginForm.tsx` | 40 (sebelumnya 71) |
| Component | `components/UserSettingsView.tsx` | 173 (sebelumnya 239) |

Path: `src/features-internal/feature-auth/`

---

## 5. Rules

1. **JANGAN extract Tailwind classes** — biarkan hardcoded di component
2. **Service = pure functions** — tidak boleh import React, hooks, atau component
3. **Hook = orchestrator** — gabung data dari feature lain + local state + service
4. **Component = rendering only** — panggil hook, render pakai UI_LABELS dan ROUTES
5. **i18n = mirror exact** dari ui-labels.ts, struktur object harus sama persis
6. **Naming**: `{FEATURE}_ROUTES`, `UI_LABELS`, `{FEATURE}_CONFIG`, `{FEATURE}_ID`
7. **Dynamic strings**: gunakan function, bukan template literal di component
8. **Magic numbers**: extract ke `{FEATURE}_CONFIG`, bukan hardcoded di hook/component
9. **Icons**: import langsung dari `lucide-react` di `config/icons.ts`, JANGAN dari `@/lib/config/client`
10. **Zero external config**: TIDAK BOLEH import `@/lib/config/*` — setiap feature harus berdiri sendiri

**Yang BOLEH import dari luar feature**:
- `@/components/ui` — UI primitives (Button, Input, Card, Stack, dll)
- `@/lib/api-client` — HTTP client untuk API calls
- `lucide-react` — icon components (via `config/icons.ts`)
- `next/link`, `next/navigation` — Next.js primitives
- `react` — React hooks
- `@features-internal/feature-xxx` — hook/data dari feature lain

**Yang TIDAK BOLEH import dari luar**:
- `@/lib/config/client` — labels, icons, config (harus diinternalisasi)
- `@/lib/config/*` — semua centralized config (harus diinternalisasi)

---

## 6. Features yang Perlu Refactor

| Feature | Status | Notes |
|---|---|---|
| `feature-dashboard-main` | DONE | Reference implementation |
| `feature-auth` | DONE | Fully self-contained, zero external config |
| `feature-settings` | TODO | Settings labels, route paths |
| `feature-target-registry` | TODO | CRUD labels, status strings, routes |
