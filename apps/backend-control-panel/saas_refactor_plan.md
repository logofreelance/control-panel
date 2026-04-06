# SaaS Refactoring Plan: Dynamic Target Database Integration

## 1. Konteks & Tujuan
Migrasi `backend-control-panel` dari sistem single-target (statis via `.env`) menjadi **Multi-Tenant SaaS**. Target database kini dicari secara dinamis di database internal (`target_systems.database_url`) berdasarkan header `x-target-id`.

## 2. Pekerjaan yang SUDAH Selesai ✅

### Core Infrastructure
- **`src/env.ts`**: Menghapus variabel legacy `DATABASE_URL_TARGET_BACKEND_SYSTEM` dan `GREEN_API_KEY`.
- **`src/index.ts`**: Menambahkan **SaaS Middleware** global yang secara dinamis menjemput koneksi database target via header `x-target-id`.

### Fitur Target yang Sudah Direfaktor (Gunakan Context, Bukan Env)
Semua file di bawah ini sudah diperbarui untuk mengambil koneksi dari `c.get('targetDb')`:
- `src/features-target/feature-monitor-database/block.ts`
- `src/features-target/feature-monitor-analytics/block.ts`
- `src/features-target/feature-target-database-schema/block.ts`
- `src/features-target/feature-rbac-roles/block.ts`
- `src/features-target/feature-rbac-permissions/block.ts`
- `src/features-target/feature-system-setup/block.ts`
- `src/features-target/feature-target-cors/block.ts`
- `src/features-target/feature-client-api-keys/` (Router & Controllers)

## 3. Pekerjaan Tersisa (BELUM Selesai) 🛠️

Semua pekerjaan refactoring telah selesai! ✅ Backend API sekarang sudah sepenuhnya siap untuk melayani arsitektur Multi-Tenant SaaS secara dinamis via header `x-target-id`.

## 4. Cara Pengujian
Kirim request ke API fitur target dengan menyertakan header:
`x-target-id: [UUID_DARI_TARGET_SYSTEMS_INTERNAL]`
