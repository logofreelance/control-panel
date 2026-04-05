# Refactor UI Rules

Ikuti aturan berikut secara ketat untuk setiap perubahan UI dan refactor:

1. **Dilarang Memberi Spasi Antar Huruf**: Hindari penggunaan class `tracking-*` (seperti `tracking-widest`, `tracking-tight`, dll.). Gunakan spasi default.
2. **Dilarang Membuat Ukuran Font Terlalu Kecil**: Ukuran font minimal adalah `text-xs` (12px). Hindari penggunaan ukuran pixel kustom yang sangat kecil (seperti `text-[7px]`, `text-[9px]`, dll.).
3. **Dilarang Memberi Transparansi ke Warna Text**: Hindari penggunaan opacity pada class warna teks (seperti `text-foreground/80`, `text-muted-foreground/40`, dll.). Gunakan warna solid (`text-foreground`, `text-muted-foreground`, atau warna hex/css variabel solid).
4. **Dilarang Memberi Spacing Terlalu Dalam**: Hindari penggunaan padding (`p-*`, `px-*`, `py-*`) atau gap yang berlebihan yang membuat elemen terlihat terlalu renggang.
5. **Warna Hanya Boleh Menggunakan yang Ada di globals.css**: Hanya gunakan utility warna standar yang terdaftar di `globals.css` (variables or tailwind defaults).
6. **Rounded Hanya Boleh Menggunakan yang Ada di globals.css**: Hanya gunakan variabel atau token `rounded-*` yang sudah didefinisikan secara global.
7. **Dilarang Mengcustomisasi atau Restyle Komponen Button**: Gunakan komponen `<Button>` sesuai desain aslinya (`variants`, `size`). Jangan menambahkan padding, size, atau visual manual lewat `className` yang merubah bentuk aslinya.
