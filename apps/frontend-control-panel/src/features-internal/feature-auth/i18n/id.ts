export const AUTH_ID = {
    login: {
        username: 'Nama Pengguna',
        password: 'Kata Sandi',
        usernameExample: 'cth. admin',
        passwordPlaceholder: '••••••••',
        signInToEngine: 'Masuk ke Engine',
        failedToConnect: 'Gagal terhubung ke server',
    },
    settings: {
        badge: 'Konfigurasi',
        title: 'Keamanan Pengguna',
        subtitle: 'Kelola identitas digital dan kredensial akses Anda.',
        dashboard: 'Dasbor',
    },
    identity: {
        title: 'Identitas',
        usernameLabel: 'Nama Pengguna',
        usernamePlaceholder: 'Masukkan nama pengguna',
        updateButton: 'Perbarui Identitas',
    },
    credentials: {
        title: 'Kredensial',
        currentPasswordLabel: 'Kata Sandi Saat Ini',
        newPasswordLabel: 'Kata Sandi Baru',
        confirmLabel: 'Konfirmasi Kata Sandi Baru',
        changeButton: 'Ubah Kredensial',
        passwordPlaceholder: '••••••••',
    },
    dangerZone: {
        title: 'Akses Sistem',
        subtitle: 'Akhiri sesi administrator Anda saat ini.',
        signOut: 'Keluar',
    },
    validation: {
        passwordsDoNotMatch: 'Kata sandi tidak cocok',
    },
    messages: {
        profileUpdated: 'Nama pengguna berhasil diperbarui!',
        profileUpdateFailed: 'Gagal memperbarui',
        passwordChanged: 'Kata sandi berhasil diubah!',
        passwordChangeFailed: 'Gagal mengubah kata sandi',
        errorOccurred: 'Terjadi kesalahan',
    },
} as const;
