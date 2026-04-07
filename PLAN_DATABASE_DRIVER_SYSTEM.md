# Rencana Pengembangan: Universal Database Driver & Auto-Installer

Rencana strategis untuk mentransformasi **Backend Control Panel** menjadi sebuah **Universal Database Engine** yang mendukung multi-tenant secara dinamis dan agnostik terhadap jenis database (*Database Agnostic*).

## 1. Arsitektur: Driver-Based System (DBAL)
Membangun lapisan penghubung (*Abstraction Layer*) sehingga aplikasi tidak lagi tergantung pada satu jenis database saja (misal: MySQL/TiDB).

- **Unified Interface**: Kontrak standar untuk fungsi `query`, `insert`, `update`, `delete`, dan `getSchema`.
- **Driver Factory**: Pendeteksi jenis database otomatis berdasarkan prefix URL (`mysql://`, `postgres://`, `sqlite://`).
- **SQL Dialect Translation**: Penerjemahan bahasa SQL secara otomatis (misal: penanganan `LIMIT` vs `TOP`, atau penanganan tipe data `TIMESTAMP`).
- **Query Builder Integration**: Menggunakan library seperti **Kysely** atau **Knex** untuk penulisan query yang aman dan kompatibel dengan banyak database tanpa menulis SQL manual.

## 2. Fitur: Target System Auto-Installer (Provisioning)
Memberikan kemampuan kepada pengguna untuk melakukan instalasi tabel sistem secara otomatis pada database kosong yang baru didaftarkan.

- **Check & Validation**: Melakukan tes koneksi dan memastikan database dalam keadaan siap.
- **One-Click Deployment**: Tombol "Initialize System" yang akan menjalankan seluruh skrip pembuatan tabel wajib.
- **Daftar Tabel Sistem**:
  - `users` (Manajemen User Sistem)
  - `route_dynamic` (Dynamic Routing Engine)
  - `api_keys` (Auth & Keamanan)
  - `route_logs` (Telemetry & Monitoring)
  - `database_tables` (Manajemen Schema)
  - `roles` & `permissions` (RBAC System)

## 3. Fitur: Smart Migration Engine
Sistem untuk menjaga konsistensi skema database tanpa menghapus data yang sudah ada.

- **Schema Introspection**: Melalui `information_schema`, sistem menganalisa struktur tabel saat ini secara mendalam.
- **Delta Comparison**: Membandingkan struktur database asli vs "Blueprint" yang ada di sistem.
- **Automatic Alteration**: Menjalankan perintah `ALTER TABLE` secara otomatis jika ada penambahan kolom atau perubahan tipe data.

## 4. Keunggulan Strategis
- **Zero-Manual SQL**: Pengguna tidak perlu lagi mengimpor file SQL secara manual.
- **Scalability**: Memudahkan penambahan ratusan node backend baru hanya melalui satu klik di dashboard.
- **Future-Proof**: Fleksibilitas untuk mendukung database modern lainnya (PostgreSQL, SQLite, SQL Server, bahkan NoSQL di masa depan).

---
*Rencana ini didokumentasikan sebagai panduan pengembangan jangka menengah untuk mencapai platform Backend Engine yang mandiri dan berstandar industri.*
