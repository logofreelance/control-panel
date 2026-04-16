# Aturan Refactor UI — Frontend Control Panel

Dokumen ini adalah **panduan wajib** untuk setiap perubahan UI di seluruh fitur frontend. Semua komponen yang ada dan yang akan dibuat **harus patuh 100%** terhadap aturan ini.

---

## 1. Tipografi

### Ukuran Text

| Konteks | Mobile | Desktop |
|---------|--------|---------|
| **Standar body text** | `text-lg` | `text-xl` |
| **Minimum yang diizinkan** | `text-base` | `text-base` |

> **DILARANG** menggunakan ukuran text di bawah `text-base` **kecuali diperintahkan langsung oleh user**. Tidak boleh ada `text-xs`, `text-sm`, atau ukuran custom seperti `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`. Aturan ini berlaku untuk semua elemen tanpa kecuali: heading, body, label, badge, placeholder, dan apapun.

### Hierarki Heading (TextHeading)

Ukuran heading **wajib berjenjang dari besar ke kecil** sesuai level kedalaman konten:

| Level | Fungsi | TextHeading `size` | Ukuran yang dihasilkan |
|-------|--------|--------------------|------------------------|
| **1** | Judul halaman (page title) | `h1` | `text-4xl` → `md:text-5xl` |
| **2** | Judul card / section utama | `h3` | `text-xl` → `md:text-3xl` |
| **3** | Sub-judul di dalam card | `h4` | `text-lg` → `md:text-2xl` |
| **4** | Label kecil / sub-sub-judul | `h5` | `text-base` → `md:text-lg` |
| **—** | Body text / deskripsi | Bukan heading | `text-lg` → `md:text-xl` |

> **WAJIB** mengikuti jenjang di atas. Judul card harus lebih kecil dari judul halaman, sub-judul harus lebih kecil dari judul card. Tidak boleh menggunakan `size` yang sama untuk level yang berbeda.

```tsx
{/* ✅ Benar — berjenjang */}
<TextHeading size="h1">system settings</TextHeading>           {/* page title */}
<TextHeading size="h3">identity & visuals</TextHeading>         {/* card title */}
<TextHeading size="h4">platform identity</TextHeading>          {/* sub-section */}
<p className="text-lg md:text-xl">deskripsi biasa</p>           {/* body text */}

{/* ❌ Salah — semua sama h4, tidak ada hierarki */}
<TextHeading size="h4">identity & visuals</TextHeading>
<TextHeading size="h4">platform identity</TextHeading>
```

Contoh penulisan yang benar:
```tsx
{/* ✅ Benar */}
<p className="text-lg md:text-xl">Teks deskripsi</p>
<span className="text-base">Teks label kecil</span>

{/* ❌ Salah */}
<p className="text-sm">Teks terlalu kecil</p>
<span className="text-xs">Ini dilarang</span>
<span className="text-[11px]">Ini juga dilarang</span>
```

### Ketebalan Font (Font Weight)

| Elemen | Ketebalan Maksimal |
|--------|-------------------|
| **Judul (heading)** | `font-semibold` (maksimal) |
| **Semua elemen lain** | `font-normal` (wajib) |

> **DILARANG** menggunakan `font-bold`, `font-extrabold`, `font-black` di mana pun. `font-semibold` **hanya** boleh digunakan pada judul/heading. Teks biasa, label, badge, dan elemen lainnya **wajib** `font-normal`.

```tsx
{/* ✅ Benar */}
<h1 className="font-semibold">Judul Halaman</h1>
<p className="font-normal">Deskripsi biasa</p>
<Badge>label badge font-normal</Badge>

{/* ❌ Salah */}
<h1 className="font-bold">Terlalu tebal</h1>
<p className="font-medium">Tidak boleh untuk body</p>
<Badge className="font-bold">Dilarang</Badge>
```

### Spasi Antar Huruf (Letter Spacing)

> **DILARANG** menggunakan `tracking-*` dalam bentuk apapun. Tidak boleh `tracking-tight`, `tracking-wide`, `tracking-widest`, atau `tracking-[value]`.

---

## 2. Spacing & Padding

> **DILARANG** memberi spacing/padding terlalu dalam (excessive). Gunakan spacing yang wajar dan minimal.

### Panduan Spacing

| Konteks | Rekomendasi |
|---------|-------------|
| Padding dalam Card | Gunakan default dari komponen Card |
| Gap antar elemen | `gap-2` sampai `gap-4` (wajar) |
| Padding section | `p-4` sampai `p-6` (maksimal wajar) |
| Margin antar section | `my-4` sampai `my-8` |

**Yang dilarang:**
- `p-10`, `p-12`, `p-16`, `p-20` — terlalu dalam
- `py-20`, `py-16` — terlalu dalam
- `gap-8`, `gap-10` — terlalu lebar
- `space-y-8`, `space-y-10` — terlalu lebar

---

## 3. Warna

### Warna yang Diizinkan

**Hanya** boleh menggunakan CSS variable / Tailwind token yang sudah didefinisikan di `globals.css`:

| Token Tailwind | Penggunaan |
|---------------|------------|
| `text-foreground` | Teks utama |
| `text-muted-foreground` | Teks sekunder/deskriptif |
| `text-primary` | Teks aksen/highlight |
| `text-primary-foreground` | Teks di atas bg primary |
| `text-secondary-foreground` | Teks di atas bg secondary |
| `text-accent-foreground` | Teks di atas bg accent |
| `text-destructive` | Teks error/bahaya |
| `text-destructive-foreground` | Teks di atas bg destructive |
| `text-card-foreground` | Teks di dalam Card |
| `text-popover-foreground` | Teks di dalam Popover |
| `bg-background` | Background utama |
| `bg-card` | Background Card |
| `bg-primary` | Background aksen utama |
| `bg-secondary` | Background sekunder |
| `bg-muted` | Background muted/abu |
| `bg-accent` | Background aksen |
| `bg-destructive` | Background error |
| `bg-popover` | Background popover |
| `border-border` | Warna border standar |
| `border-input` | Warna border input |
| `ring-ring` | Warna ring focus |

> **DILARANG** menggunakan transparency/opacity pada warna teks. Tidak boleh ada `text-foreground/50`, `text-muted-foreground/40`, `text-white/70`, atau bentuk opacity lainnya pada warna teks.

> **DILARANG** menggunakan warna hardcoded seperti `text-emerald-500`, `text-gray-400`, `bg-white`, `text-white`, `bg-black`, atau warna Tailwind default lainnya yang tidak ada di `globals.css`.

---

## 4. Komponen

### Komponen yang Wajib Digunakan

Semua UI **wajib** menggunakan komponen dari `@/components/ui`:

| Komponen | File |
|----------|------|
| `Accordion` | accordion.tsx |
| `AlertDialog` | alert-dialog.tsx |
| `Alert` | alert.tsx |
| `AspectRatio` | aspect-ratio.tsx |
| `Avatar` | avatar.tsx |
| `Badge` | badge.tsx |
| `Breadcrumb` | breadcrumb.tsx |
| `ButtonGroup` | button-group.tsx |
| `Button` | button.tsx |
| `Calendar` | calendar.tsx |
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | card.tsx |
| `Carousel` | carousel.tsx |
| `Chart` | chart.tsx |
| `Checkbox` | checkbox.tsx |
| `Collapsible` | collapsible.tsx |
| `Combobox` | combobox.tsx |
| `Command` | command.tsx |
| `ContextMenu` | context-menu.tsx |
| `Dialog` | dialog.tsx |
| `Drawer` | drawer.tsx |
| `DropdownMenu` | dropdown-menu.tsx |
| `Empty` | empty.tsx |
| `Field` | field.tsx |
| `HoverCard` | hover-card.tsx |
| `InputGroup` | input-group.tsx |
| `InputOTP` | input-otp.tsx |
| `Input` | input.tsx |
| `Item` | item.tsx |
| `Kbd` | kbd.tsx |
| `Label` | label.tsx |
| `Menubar` | menubar.tsx |
| `Modal` | modal.tsx |
| `NativeSelect` | native-select.tsx |
| `NavigationMenu` | navigation-menu.tsx |
| `PageTitle` | page-title.tsx |
| `Pagination` | pagination.tsx |
| `Popover` | popover.tsx |
| `Progress` | progress.tsx |
| `RadioGroup` | radio-group.tsx |
| `Resizable` | resizable.tsx |
| `ScrollArea` | scroll-area.tsx |
| `Select` | select.tsx |
| `Separator` | separator.tsx |
| `Sheet` | sheet.tsx |
| `Sidebar` | sidebar.tsx |
| `Skeleton` | skeleton.tsx |
| `Slider` | slider.tsx |
| `Sonner` | sonner.tsx |
| `Spinner` | spinner.tsx |
| `Switch` | switch.tsx |
| `Table` | table.tsx |
| `Tabs` | tabs.tsx |
| `TextHeading` | text-heading.tsx |
| `Textarea` | textarea.tsx |
| `ToggleGroup` | toggle-group.tsx |
| `Toggle` | toggle.tsx |
| `Tooltip` | tooltip.tsx |

### Larangan Komponen

> **DILARANG** mengkustomisasi style dari komponen apa pun yang digunakan (dari `@/components/ui` seperti `Card`, `Button`, `Input`, `Badge`, dsb.) menggunakan prop `className` custom jika tidak diperintahkan langsung oleh user. Biarkan komponen menggunakan default styling-nya (gunakan varian yang tersedia melalui props).

> **DILARANG** membuat komponen UI custom sendiri (div dengan styling manual) jika sudah tersedia komponen yang sesuai di `@/components/ui`. Gunakan yang sudah ada.

---

## 5. Ringkasan Larangan

| # | Aturan | Status |
|---|--------|--------|
| 1 | Ukuran text di bawah `text-base` tanpa perintah user | ❌ DILARANG |
| 2 | `font-bold`, `font-extrabold`, `font-black` | ❌ DILARANG |
| 3 | `font-medium`, `font-semibold` pada non-heading | ❌ DILARANG |
| 4 | `tracking-*` (spasi antar huruf) | ❌ DILARANG |
| 5 | Transparency pada warna text (`/50`, `/40`, dll) | ❌ DILARANG |
| 6 | Warna hardcoded (bukan dari globals.css) | ❌ DILARANG |
| 7 | Spacing terlalu dalam (`p-10`, `py-20`, dll) | ❌ DILARANG |
| 8 | Kustomisasi style komponen apapun (termasuk Card) tanpa perintah | ❌ DILARANG |
| 9 | Membuat komponen UI custom jika sudah ada di `@/components/ui` | ❌ DILARANG |
| 10 | Heading size sama untuk level berbeda (tidak berjenjang) | ❌ DILARANG |
| 11 | Body text standar: mobile `text-lg`, desktop `text-xl` | ✅ WAJIB |
| 12 | Ketebalan font body: `font-normal` | ✅ WAJIB |
| 13 | Heading maksimal `font-semibold` | ✅ WAJIB |
| 14 | Hierarki heading: h1 → h3 → h4 → h5 (berjenjang) | ✅ WAJIB |
