export const DASHBOARD_ID = {
  badge: {
    brand: 'Node Registry 2.0',
  },
  hero: {
    headline: 'Ke mana fokus mengalir,<br/>energi pun mengikuti.',
    searchPlaceholder: 'Temukan sistem dan node terhubung...',
  },
  stats: {
    title: 'Volume Inventaris',
    badge: 'Sistem',
    activeLinks: (count: number) => `${count} Tautan Aktif`,
    registerNode: 'Daftarkan Node',
    targetSystem: 'Sistem Target',
  },
  nodePool: {
    title: 'Daftar Sistem Target',
    empty: 'Monitor Kosong',
    noMatches: 'Tidak Ditemukan',
  },
  nav: {
    account: 'Akun',
    profileDetails: 'Detail Profil',
    preferences: 'Preferensi',
    signOut: 'Keluar',
    systemUser: 'Pengguna Sistem',
    consoleOperator: 'Operator Konsol',
  },
} as const;
