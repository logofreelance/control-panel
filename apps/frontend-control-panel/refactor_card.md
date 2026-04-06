# Flat Luxury: Card Usage Protocol

Aturan penggunaan komponen `<Card>` untuk menjaga konsistensi desain **Flat Luxury**. Aturan ini dikhususkan untuk **Standard Content Cards** (dokumentasi, data, dan informasi umum). Untuk kartu yang membutuhkan desain khusus (unique UI), kustomisasi tetap diperbolehkan dengan tetap mengikuti semangat minimalis.

## 1. Standard Content Cards (No Restyle)
Untuk kartu berisi konten standar, dilarang menambahkan kelas-kelas berikut secara manual karena sudah ditangani secara global di `src/components/ui/card.tsx`:
- **Shadow**: Dilarang menggunakan `shadow-*`, `shadow-none`, dsb.
- **Border**: Dilarang menggunakan `border`, `border-*`, atau `border-none`.
- **Rounding**: Dilarang menggunakan `rounded-*`.

> [!NOTE]
> Jika Anda sedang membangun komponen unik (misalnya: dashboard widget khusus, interactive tool, atau visualisasi data kompleks), Anda **diperbolehkan** melakukan kustomisasi penuh pada `<Card>` agar mencapai tujuan fungsionalitas dan estetika yang diinginkan.

## 2. Layout & Spacing
Modifikasi `className` hanya diperbolehkan untuk kebutuhan tata letak makro:
- **Width/Height**: Contoh `w-full`, `max-w-md`, atau `h-fit`.
- **Margin**: Contoh `mb-4`, `mt-2` untuk mengatur jarak antar komponen.
- **Animate**: Diperbolehkan menggunakan kelas animasi seperti `animate-in fade-in`.

## 3. Background Variants
Warna latar belakang default adalah `bg-card`. Gunakan `className` jika membutuhkan varian khusus:
- **Subtle Background**: Gunakan `bg-muted/30` atau `bg-muted/40` untuk membedakan area konten.
- **High Contrast**: Gunakan `bg-foreground text-background` hanya untuk panel informasi kritikal (seperti Technical Notes).

## 4. Content Structure
Selalu gunakan komponen sub-shadcn untuk menjaga padding internal yang seragam:
- **Padding**: Jangan menambahkan `p-*` manual pada `<Card>`. Gunakan `<CardContent>` atau biarkan default padding yang bekerja.
- **Card Action**: Gunakan `<CardAction>` jika terdapat tombol aksi di pojok kanan atas kartu.

## 5. Lowercase Consistency
Seluruh teks di dalam kartu (judul, badge, deskripsi) **WAJIB** menggunakan huruf kecil (*lowercase*), kecuali variabel data dinamis yang memang membutuhkan *case* sensitif.

---
**Ingat: Jika Anda merasa perlu menambahkan `border` atau `shadow` manual, berarti Anda melanggar standar Flat Luxury.**
