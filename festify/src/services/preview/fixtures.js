/**
 * DATA PRATINJAU — HANYA UNTUK REVIEW DESAIN TAHAP 2.
 * File ini akan dihapus di Tahap 4 ketika service terhubung ke Supabase.
 * Struktur kolom mengikuti rancangan tabel PostgreSQL Festify.
 */
const day = 86400000
const at = (offsetDays, hour = 19, min = 0) => {
  const d = new Date(Date.now() + offsetDays * day)
  d.setUTCHours(hour - 7, min, 0, 0) // WIB → UTC
  return d.toISOString()
}

export const categories = [
  { id: 1, name: 'Musik', slug: 'musik', description: 'Konser, gig, dan festival musik', icon: 'Music', color: '#be3496' },
  { id: 2, name: 'Edukasi', slug: 'edukasi', description: 'Seminar, talkshow, kelas', icon: 'GraduationCap', color: '#6a0dad' },
  { id: 3, name: 'Pameran', slug: 'pameran', description: 'Expo, bazaar, pameran seni', icon: 'Frame', color: '#f28c1c' },
  { id: 4, name: 'Workshop', slug: 'workshop', description: 'Belajar langsung praktik', icon: 'Hammer', color: '#f43f5e' },
  { id: 5, name: 'Seni & Budaya', slug: 'seni-budaya', description: 'Teater, tari, budaya', icon: 'Drama', color: '#8433cc' },
  { id: 6, name: 'Olahraga', slug: 'olahraga', description: 'Fun run, turnamen', icon: 'Trophy', color: '#15803d' },
  { id: 7, name: 'Kuliner', slug: 'kuliner', description: 'Festival makanan', icon: 'UtensilsCrossed', color: '#d92d4c' },
  { id: 8, name: 'Teknologi', slug: 'teknologi', description: 'Tech meetup, hackathon', icon: 'Cpu', color: '#1d4ed8' },
  { id: 9, name: 'Komunitas', slug: 'komunitas', description: 'Gathering & meetup', icon: 'Users', color: '#b45309' },
  { id: 10, name: 'Festival', slug: 'festival', description: 'Festival multi-acara', icon: 'PartyPopper', color: '#be3496' },
]

export const regions = [
  ['DKI Jakarta', 'Jakarta Pusat'], ['DKI Jakarta', 'Jakarta Utara'], ['DKI Jakarta', 'Jakarta Barat'],
  ['DKI Jakarta', 'Jakarta Selatan'], ['DKI Jakarta', 'Jakarta Timur'], ['DKI Jakarta', 'Kepulauan Seribu'],
  ['Jawa Barat', 'Kota Bogor'], ['Jawa Barat', 'Kabupaten Bogor'], ['Jawa Barat', 'Kota Depok'],
  ['Banten', 'Kota Tangerang'], ['Banten', 'Kabupaten Tangerang'], ['Banten', 'Kota Tangerang Selatan'],
  ['Jawa Barat', 'Kota Bekasi'], ['Jawa Barat', 'Kabupaten Bekasi'],
].map(([province, city], i) => ({
  id: i + 1,
  province,
  city,
  district: null,
  slug: city.toLowerCase().replace(/\s+/g, '-'),
}))

export const profiles = [
  { id: 'u-user', full_name: 'Rani Pratiwi', email: 'rani@contoh.id', avatar_url: null, role: 'user', created_at: at(-90) },
  { id: 'u-org1', full_name: 'Nada Nusantara Production', email: 'halo@nadanusantara.id', avatar_url: null, role: 'organizer', created_at: at(-200) },
  { id: 'u-org2', full_name: 'Kreasi Digital Hub', email: 'info@kreasidigital.id', avatar_url: null, role: 'organizer', created_at: at(-150) },
  { id: 'u-admin', full_name: 'Admin Festify', email: 'admin@festify.id', avatar_url: null, role: 'admin', created_at: at(-365) },
  { id: 'u-4', full_name: 'Bagas Saputra', email: 'bagas@contoh.id', avatar_url: null, role: 'user', created_at: at(-40) },
  { id: 'u-5', full_name: 'Salsa Aulia', email: 'salsa@contoh.id', avatar_url: null, role: 'user', created_at: at(-12) },
]

export const organizerProfiles = [
  { user_id: 'u-org1', organization_name: 'Nada Nusantara Production', bio: 'Promotor musik independen sejak 2015. Kami membawa panggung indie ke berbagai kota.', phone: '0812-0000-1111', website_url: 'https://contoh.id', instagram: '@nadanusantara', logo_url: null },
  { user_id: 'u-org2', organization_name: 'Kreasi Digital Hub', bio: 'Ruang belajar desain dan teknologi untuk talenta digital Indonesia.', phone: '0813-0000-2222', website_url: 'https://contoh.id', instagram: '@kreasidigital', logo_url: null },
]

const ev = (id, o) => ({
  id: `e-${id}`,
  organizer_id: 'u-org1',
  latitude: -6.2185,
  longitude: 106.8017,
  poster_url: null,
  status: 'published',
  archived_at: null,
  created_at: at(-30 + id),
  updated_at: at(-5),
  ...o,
})

export const events = [
  ev(1, { title: 'Jakarta Indie Fest 2026', slug: 'jakarta-indie-fest-2026', category_id: 1, region_id: 1, venue_name: 'Istora Senayan', address: 'Jl. Pintu Satu Senayan, Gelora, Tanah Abang', start_date: at(9, 14), end_date: at(9, 23), ticket_price_min: 250000, ticket_price_max: 650000, ticket_url: 'https://contoh-tiket.id/indie-fest', description: 'Festival musik indie terbesar di Jakarta dengan lebih dari 20 penampil lintas genre — folk, dream pop, hingga rock alternatif.\n\nDua panggung utama, area kuliner UMKM lokal, dan zona merchandise kolaborasi eksklusif. Gerbang dibuka pukul 14.00 WIB.' }),
  ev(2, { organizer_id: 'u-org2', title: 'Workshop UI/UX Design Sprint', slug: 'workshop-uiux-design-sprint', category_id: 4, region_id: 4, venue_name: 'Kreasi Digital Hub', address: 'Jl. Kemang Raya No. 12, Bangka, Mampang Prapatan', latitude: -6.2603, longitude: 106.8139, start_date: at(16, 9), end_date: at(16, 17), ticket_price_min: 150000, ticket_price_max: null, ticket_url: 'https://contoh-tiket.id/design-sprint', description: 'Belajar metode Design Sprint lima hari yang dipadatkan menjadi satu hari penuh: riset cepat, ideasi, prototyping di Figma, dan uji dengan pengguna nyata bersama mentor praktisi. Laptop wajib dibawa.' }),
  ev(3, { title: 'Pameran Seni Rupa "Garis Kota"', slug: 'pameran-garis-kota', category_id: 3, region_id: 1, venue_name: 'Galeri Nasional Indonesia', address: 'Jl. Medan Merdeka Timur No. 14, Gambir', latitude: -6.1786, longitude: 106.8325, start_date: at(3, 10), end_date: at(24, 20), ticket_price_min: 0, ticket_price_max: 0, ticket_url: 'https://contoh-tiket.id/garis-kota', description: 'Pameran 40 perupa muda yang merekam wajah kota lewat sketsa, mural, dan instalasi interaktif.' }),
  ev(4, { title: 'Festival Kuliner Nusantara', slug: 'festival-kuliner-nusantara', category_id: 7, region_id: 12, venue_name: 'ICE BSD', address: 'Jl. BSD Grand Boulevard, Pagedangan', latitude: -6.3007, longitude: 106.6367, start_date: at(5, 11), end_date: at(7, 22), ticket_price_min: 25000, ticket_price_max: 50000, ticket_url: 'https://contoh-tiket.id/kuliner', description: 'Lebih dari 150 tenant kuliner dari 34 provinsi, demo masak, dan panggung musik akustik setiap malam.' }),
  ev(5, { organizer_id: 'u-org2', title: 'Tech Meetup: AI untuk UMKM', slug: 'tech-meetup-ai-umkm', category_id: 8, region_id: 4, venue_name: 'CoHive Mega Kuningan', address: 'Jl. Mega Kuningan Barat, Setiabudi', latitude: -6.2297, longitude: 106.8253, start_date: at(12, 18, 30), end_date: at(12, 21), ticket_price_min: 0, ticket_price_max: null, ticket_url: 'https://contoh-tiket.id/ai-umkm', description: 'Diskusi praktis pemanfaatan AI untuk pemasaran, layanan pelanggan, dan pembukuan usaha kecil.' }),
  ev(6, { title: 'Jakarta Night Run 10K', slug: 'jakarta-night-run-10k', category_id: 6, region_id: 1, venue_name: 'Bundaran HI', address: 'Jl. M.H. Thamrin, Menteng', latitude: -6.1951, longitude: 106.823, start_date: at(20, 19), end_date: at(20, 23), ticket_price_min: 300000, ticket_price_max: 450000, ticket_url: 'https://contoh-tiket.id/night-run', description: 'Lari malam menyusuri jantung kota dengan rute 5K dan 10K, lengkap dengan race pack dan medali finisher.' }),
  ev(7, { title: 'Teater Musikal "Lintang"', slug: 'teater-musikal-lintang', category_id: 5, region_id: 1, venue_name: 'Gedung Kesenian Jakarta', address: 'Jl. Gedung Kesenian No. 1, Sawah Besar', latitude: -6.1663, longitude: 106.8344, start_date: at(27, 19, 30), end_date: at(28, 22), ticket_price_min: 175000, ticket_price_max: 750000, ticket_url: 'https://contoh-tiket.id/lintang', description: 'Kisah anak nelayan yang bermimpi menjadi pemusik, dibawakan 60 pemain dan orkestra langsung.' }),
  ev(8, { organizer_id: 'u-org2', title: 'Seminar Karier Kreatif 2026', slug: 'seminar-karier-kreatif-2026', category_id: 2, region_id: 9, venue_name: 'Universitas Indonesia — Balairung', address: 'Kampus UI, Beji', latitude: -6.3627, longitude: 106.8269, start_date: at(14, 8), end_date: at(14, 15), ticket_price_min: 50000, ticket_price_max: null, ticket_url: 'https://contoh-tiket.id/karier-kreatif', description: 'Talkshow bersama praktisi industri kreatif: desain, film, game, dan konten digital.' }),
  ev(9, { title: 'Bekasi Komunitas Fair', slug: 'bekasi-komunitas-fair', category_id: 9, region_id: 13, venue_name: 'Summarecon Mall Bekasi', address: 'Jl. Bulevar Ahmad Yani, Bekasi Utara', latitude: -6.2253, longitude: 107.0005, start_date: at(10, 10), end_date: at(11, 21), ticket_price_min: 0, ticket_price_max: 0, ticket_url: 'https://contoh-tiket.id/komunitas-fair', description: 'Puluhan komunitas hobi berkumpul: fotografi, board game, sepeda, hingga pecinta tanaman.' }),
  ev(10, { title: 'Bogor Jazz di Kebun', slug: 'bogor-jazz-di-kebun', category_id: 1, region_id: 7, venue_name: 'Kebun Raya Bogor', address: 'Jl. Ir. H. Juanda No. 13, Bogor Tengah', latitude: -6.5976, longitude: 106.7996, start_date: at(33, 15), end_date: at(33, 22), ticket_price_min: 200000, ticket_price_max: 400000, ticket_url: 'https://contoh-tiket.id/jazz-kebun', description: 'Jazz sore hingga malam di bawah rindang pepohonan Kebun Raya.' }),
  ev(11, { title: 'Festival Budaya Betawi', slug: 'festival-budaya-betawi', category_id: 10, region_id: 3, venue_name: 'Setu Babakan', address: 'Jl. Moch. Kahfi II, Jagakarsa', latitude: -6.3424, longitude: 106.8252, start_date: at(19, 9), end_date: at(21, 21), ticket_price_min: 0, ticket_price_max: 0, ticket_url: 'https://contoh-tiket.id/betawi', description: 'Ondel-ondel, lenong, gambang kromong, dan kuliner khas Betawi selama tiga hari.' }),
  ev(12, { organizer_id: 'u-org2', title: 'Hackathon Kota Cerdas', slug: 'hackathon-kota-cerdas', category_id: 8, region_id: 10, venue_name: 'Tangerang Creative Hub', address: 'Jl. Jend. Sudirman, Cikokol', latitude: -6.1783, longitude: 106.6319, start_date: at(40, 9), end_date: at(41, 17), ticket_price_min: 0, ticket_price_max: null, ticket_url: 'https://contoh-tiket.id/hackathon', description: '36 jam membangun solusi untuk transportasi, sampah, dan layanan publik.' }),
  ev(13, { title: 'Konser Akhir Tahun "Pulang"', slug: 'konser-akhir-tahun-pulang', status: 'draft', category_id: 1, region_id: 4, venue_name: 'Tennis Indoor Senayan', address: 'Gelora Bung Karno', start_date: at(42, 19), end_date: at(42, 23), ticket_price_min: 350000, ticket_price_max: 1200000, ticket_url: '', description: 'Masih disiapkan.' }),
  ev(14, { title: 'Bazar Buku Murah', slug: 'bazar-buku-murah', status: 'completed', category_id: 3, region_id: 5, venue_name: 'JIExpo Kemayoran', address: 'Kemayoran', start_date: at(-20, 10), end_date: at(-15, 21), ticket_price_min: 0, ticket_price_max: 0, ticket_url: 'https://contoh-tiket.id/bazar', description: 'Bazar buku tahunan.' }),
]

export const schedules = [
  ['e-1', '14:00', '15:00', 'Gerbang dibuka & warm up DJ', 'DJ Senja', 'Panggung Timur'],
  ['e-1', '15:30', '16:30', 'Penampilan pembuka', 'Teman Sebangku', 'Panggung Timur'],
  ['e-1', '17:00', '18:15', 'Sesi sore', 'Kopi Pagi Band', 'Panggung Barat'],
  ['e-1', '19:30', '21:00', 'Headliner', 'Laut Biru', 'Panggung Utama'],
  ['e-2', '09:00', '10:30', 'Understand & Map', 'Dimas A.', 'Ruang Utama'],
  ['e-2', '10:45', '12:00', 'Sketch & Decide', 'Dimas A.', 'Ruang Utama'],
  ['e-2', '13:00', '15:30', 'Prototype di Figma', 'Nadia R.', 'Lab Komputer'],
  ['e-2', '15:45', '17:00', 'Test dengan pengguna', 'Tim Mentor', 'Ruang Utama'],
].map(([event_id, s, e, title, speaker, location], i) => {
  const base = events.find((x) => x.id === event_id).start_date.slice(0, 10)
  return { id: `s-${i}`, event_id, title, description: null, speaker, location, start_time: `${base}T${s}:00+07:00`, end_time: `${base}T${e}:00+07:00`, sort_order: i }
})

export const performers = [
  ['e-1', 'Laut Biru', 'Headliner'], ['e-1', 'Kopi Pagi Band', 'Band'], ['e-1', 'Teman Sebangku', 'Band'], ['e-1', 'DJ Senja', 'DJ'],
  ['e-2', 'Dimas Anggara', 'Product Designer'], ['e-2', 'Nadia Rahma', 'UX Researcher'],
  ['e-5', 'Ayu Lestari', 'Pembicara'], ['e-8', 'Reza Mahendra', 'Pembicara'],
].map(([event_id, name, role], i) => ({ id: `p-${i}`, event_id, name, role, photo_url: null, sort_order: i }))

export const media = [
  { id: 'm-1', event_id: 'e-1', file_type: 'video_link', file_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', caption: 'Aftermovie 2025', is_primary: false, sort_order: 0 },
]

const rv = (id, event_id, user_id, rating, comment, daysAgo, status = 'visible') => ({ id: `r-${id}`, event_id, user_id, rating, comment, status, created_at: at(-daysAgo, 12), updated_at: at(-daysAgo, 12) })
export const reviews = [
  rv(1, 'e-1', 'u-user', 5, 'Lineup-nya keren banget, tahun lalu sound system-nya juga mantap. Wajib datang!', 6),
  rv(2, 'e-1', 'u-4', 4, 'Venue luas, semoga antrean masuk tahun ini lebih rapi.', 4),
  rv(3, 'e-1', 'u-5', 5, 'Area UMKM-nya seru, banyak jajanan enak.', 2),
  rv(4, 'e-2', 'u-user', 5, 'Mentornya sabar dan materinya langsung bisa dipraktikkan.', 10),
  rv(5, 'e-3', 'u-4', 4, 'Instalasi interaktifnya keren untuk foto.', 1),
  rv(6, 'e-4', 'u-5', 3, 'Makanannya enak tapi parkir penuh.', 3),
  rv(7, 'e-14', 'u-user', 4, 'Diskonnya banyak, tapi panas.', 14),
  rv(8, 'e-1', 'u-4', 1, 'spam spam promo slot', 1, 'hidden'),
]

export const replies = [
  { id: 'rr-1', review_id: 'r-2', organizer_id: 'u-org1', reply: 'Terima kasih masukannya! Tahun ini kami menambah 6 jalur gate masuk.', created_at: at(-3, 9) },
]

export const favorites = [
  { id: 'f-1', user_id: 'u-user', event_id: 'e-1', created_at: at(-5) },
  { id: 'f-2', user_id: 'u-user', event_id: 'e-7', created_at: at(-2) },
]

export const notifications = [
  { id: 'n-1', user_id: 'u-user', title: 'Jadwal event berubah', message: 'Jakarta Indie Fest 2026 memajukan jam buka gerbang menjadi 14.00 WIB.', notification_type: 'event_updated', reference_id: 'e-1', is_read: false, created_at: at(-0.2) },
  { id: 'n-2', user_id: 'u-user', title: 'Ulasanmu dibalas', message: 'Nada Nusantara Production membalas ulasanmu.', notification_type: 'review_reply', reference_id: 'e-1', is_read: false, created_at: at(-1) },
  { id: 'n-3', user_id: 'u-user', title: 'Selamat datang di Festify!', message: 'Simpan event favoritmu dan dapatkan kabar terbarunya di sini.', notification_type: 'system', reference_id: null, is_read: true, created_at: at(-80) },
  { id: 'n-4', user_id: 'u-org1', title: 'Ulasan baru', message: 'Salsa Aulia memberi 5 bintang untuk Jakarta Indie Fest 2026.', notification_type: 'review_new', reference_id: 'e-1', is_read: false, created_at: at(-2) },
  { id: 'n-5', user_id: 'u-admin', title: 'Organizer baru', message: 'Kreasi Digital Hub terdaftar sebagai organizer.', notification_type: 'system', reference_id: null, is_read: false, created_at: at(-1) },
]

export const blockedWords = ['anjing', 'bangsat', 'bajingan', 'tolol', 'goblok', 'kampret', 'brengsek', 'bego', 'anjir', 'slot gacor', 'judi online'].map((word, i) => ({ id: i + 1, word, created_at: at(-100) }))

/** statistik harian 30 hari terakhir (deterministik) */
export const dailyStats = events.flatMap((e, ei) =>
  Array.from({ length: 30 }, (_, i) => {
    const seed = Math.sin((ei + 1) * 9301 + i * 49297) * 233280
    const r = seed - Math.floor(seed)
    const views = Math.round((40 + ei * 6) * (0.6 + r) + i * (2 + (ei % 3)))
    return {
      event_id: e.id,
      stat_date: new Date(Date.now() - (29 - i) * day).toISOString().slice(0, 10),
      views: e.status === 'draft' ? 0 : views,
      ticket_clicks: e.status === 'draft' ? 0 : Math.round(views * (0.08 + r * 0.06)),
      favorites: e.status === 'draft' ? 0 : Math.round(r * 4),
      reviews: 0,
    }
  }),
)
