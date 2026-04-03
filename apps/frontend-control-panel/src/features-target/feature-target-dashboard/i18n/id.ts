export const TARGET_DASHBOARD_ID = {
    header: {
        pageBadge: 'Registri Target',
        separator: '/',
    },
    status: {
        online: 'Koneksi Edge Aktif',
        offline: 'Node Terputus',
    },
    sync: {
        syncing: 'Menyinkronkan...',
        synchronize: 'Sinkronkan',
    },
    notFound: {
        title: 'Node tidak ditemukan',
        description: 'ID Node yang disinkronkan mungkin telah kedaluwarsa atau berubah.',
        backToRegistry: 'Kembali ke Registri',
    },
    metrics: {
        activeRoutes: 'Rute Aktif',
        heartbeat: 'Detak Jantung',
        latency: 'Latensi',
        uptime: 'Waktu Aktif',
    },
    infrastructure: {
        title: 'Tumpukan Infrastruktur',
        defaultDescription: 'Sistem target ini mengelola perutean data latensi rendah dan sinkronisasi tepi untuk infrastruktur enterprise terdistribusi.',
        cloudGateway: 'Gateway Cloud',
        cloudGatewayDefault: 'edge-discovery.io',
        masterSyncDb: 'DB Sinkronisasi Utama',
        identityProtocol: 'Protokol Identitas',
    },
    connectivity: {
        title: 'Log Konektivitas',
        subtitle: 'Stabilitas Historis',
    },
    commandHub: {
        title: 'Pusat Perintah',
        databaseSchema: 'Skema Database',
        nodeConfiguration: 'Konfigurasi Node',
        wipeNodeCache: 'Hapus Cache Node',
    },
    integrity: {
        title: 'Integritas Layanan',
        status: '100.0',
        statusSuffix: '%',
        description: 'Sinkronisasi mendalam terakhir berhasil di semua node tepi. Tidak ada konflik terdeteksi.',
    },
    time: {
        never: 'Tidak Pernah',
        justNow: 'Baru saja',
        minutesAgo: (m: number) => `${m}m lalu`,
        hoursAgo: (h: number) => `${h}j lalu`,
        daysAgo: (d: number) => `${d}h lalu`,
    },
} as const;
