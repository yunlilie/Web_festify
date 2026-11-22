export const ROLES = { USER: 'user', ORGANIZER: 'organizer', ADMIN: 'admin' }

export const ROLE_LABEL = { user: 'User', organizer: 'Organizer', admin: 'Admin' }

export const EVENT_STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'success' },
  cancelled: { label: 'Dibatalkan', tone: 'danger' },
  completed: { label: 'Selesai', tone: 'info' },
}

export const SORT_OPTIONS = [
  { value: 'upcoming', label: 'Paling dekat' },
  { value: 'newest', label: 'Terbaru ditambahkan' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'price_asc', label: 'Harga terendah' },
  { value: 'price_desc', label: 'Harga tertinggi' },
]

export const DATE_PRESETS = [
  { value: '', label: 'Kapan saja' },
  { value: 'today', label: 'Hari ini' },
  { value: 'weekend', label: 'Akhir pekan ini' },
  { value: 'week', label: '7 hari ke depan' },
  { value: 'month', label: 'Bulan ini' },
  { value: 'custom', label: 'Pilih tanggal' },
]

export const PAGE_SIZE = 12

export const FILE_RULES = {
  image: { types: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 5 * 1024 * 1024, label: 'JPG, PNG, atau WebP (maks. 5 MB)' },
  video: { types: ['video/mp4', 'video/webm'], maxBytes: 50 * 1024 * 1024, label: 'MP4 atau WebM (maks. 50 MB)' },
}

export const NOTIF_TYPES = {
  review_new: 'Ulasan baru',
  review_reply: 'Balasan ulasan',
  event_updated: 'Perubahan event',
  event_cancelled: 'Event dibatalkan',
  announcement: 'Pengumuman',
  system: 'Sistem',
}
