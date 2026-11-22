// Event publik + manajemen event organizer.
// Tahap 4: diganti query Supabase (view `public_events`, RPC record_event_view / record_ticket_click).
import { db, delay, uid, nowIso, hydrateEvent, ServiceError } from './preview/db'
import { PAGE_SIZE } from '@/utils/constants'
import { slugify } from '@/utils/slugify'

const isPublic = (e) => e.status === 'published' && !e.archived_at

const dateWindow = (preset, from, to) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  switch (preset) {
    case 'today': end.setDate(end.getDate() + 1); return [start, end]
    case 'week': end.setDate(end.getDate() + 7); return [start, end]
    case 'month': return [start, new Date(start.getFullYear(), start.getMonth() + 1, 1)]
    case 'weekend': {
      const s = new Date(start)
      const dow = s.getDay()
      s.setDate(s.getDate() + ((6 - dow + 7) % 7))
      const e = new Date(s)
      e.setDate(e.getDate() + 2)
      return [dow === 0 ? start : s, e]
    }
    case 'custom': return [from ? new Date(from) : null, to ? new Date(new Date(to).getTime() + 86400000) : null]
    default: return [null, null]
  }
}

/** Daftar event published dengan filter, sort, dan pagination. */
export async function listEvents({ q = '', category = '', region = '', date = '', from = '', to = '', min = '', max = '', sort = 'upcoming', page = 1, pageSize = PAGE_SIZE } = {}) {
  await delay()
  const term = q.trim().toLowerCase()
  const [ds, de] = dateWindow(date, from, to)
  const cat = db.categories.find((c) => c.slug === category)
  const reg = db.regions.find((r) => r.slug === region)
  let rows = db.events.filter(isPublic).filter((e) => {
    if (term && !`${e.title} ${e.description}`.toLowerCase().includes(term)) return false
    if (category && e.category_id !== cat?.id) return false
    if (region && e.region_id !== reg?.id) return false
    if (ds && new Date(e.end_date || e.start_date) < ds) return false
    if (de && new Date(e.start_date) >= de) return false
    if (min !== '' && Number(e.ticket_price_max ?? e.ticket_price_min ?? 0) < Number(min)) return false
    if (max !== '' && Number(e.ticket_price_min ?? 0) > Number(max)) return false
    return true
  }).map(hydrateEvent)

  const sorters = {
    upcoming: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
    popular: (a, b) => b.statistics.total_views - a.statistics.total_views,
    rating: (a, b) => b.statistics.average_rating - a.statistics.average_rating,
    price_asc: (a, b) => (a.ticket_price_min ?? 0) - (b.ticket_price_min ?? 0),
    price_desc: (a, b) => (b.ticket_price_max ?? b.ticket_price_min ?? 0) - (a.ticket_price_max ?? a.ticket_price_min ?? 0),
  }
  rows.sort(sorters[sort] || sorters.upcoming)
  const count = rows.length
  const startIdx = (page - 1) * pageSize
  return { data: rows.slice(startIdx, startIdx + pageSize), count }
}

/** Bagian-bagian halaman utama. */
export async function getHomeSections(userId) {
  await delay()
  const pub = db.events.filter(isPublic).map(hydrateEvent)
  const popular = [...pub].sort((a, b) => b.statistics.total_views - a.statistics.total_views).slice(0, 8)
  const latest = [...pub].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8)
  const favCats = new Set(db.favorites.filter((f) => f.user_id === userId).map((f) => db.events.find((e) => e.id === f.event_id)?.category_id))
  const favIds = new Set(db.favorites.filter((f) => f.user_id === userId).map((f) => f.event_id))
  let recommended = pub.filter((e) => favCats.has(e.category_id) && !favIds.has(e.id))
  if (recommended.length < 4) recommended = [...recommended, ...[...pub].sort((a, b) => b.statistics.average_rating - a.statistics.average_rating).filter((e) => !recommended.includes(e))]
  const regionCounts = db.regions
    .map((r) => ({ ...r, total: pub.filter((e) => e.region_id === r.id).length }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
  return { popular, latest, recommended: recommended.slice(0, 8), regions: regionCounts, totalEvents: pub.length }
}

/** Detail event publik (published / completed bisa dibuka lewat link). */
export async function getEventBySlug(slug) {
  await delay()
  const e = db.events.find((x) => x.slug === slug && (x.status === 'published' || x.status === 'completed' || x.status === 'cancelled') && !x.archived_at)
  if (!e) return null
  const orgProfile = db.organizerProfiles.find((o) => o.user_id === e.organizer_id)
  return {
    ...hydrateEvent(e),
    organizer_profile: orgProfile || null,
    schedules: db.schedules.filter((s) => s.event_id === e.id).sort((a, b) => a.sort_order - b.sort_order),
    performers: db.performers.filter((p) => p.event_id === e.id).sort((a, b) => a.sort_order - b.sort_order),
    media: db.media.filter((m) => m.event_id === e.id).sort((a, b) => a.sort_order - b.sort_order),
  }
}

export async function getRelatedEvents(event, limit = 4) {
  await delay(150)
  return db.events
    .filter((e) => isPublic(e) && e.id !== event.id && (e.category_id === event.category_id || e.region_id === event.region_id))
    .map(hydrateEvent)
    .sort((a, b) => (b.category_id === event.category_id) - (a.category_id === event.category_id))
    .slice(0, limit)
}

export async function listEventsByOrganizer(organizerId) {
  await delay()
  return db.events.filter((e) => isPublic(e) && e.organizer_id === organizerId).map(hydrateEvent)
}

/** Pencatatan view — di Supabase: RPC record_event_view(event_id, viewer_key) dengan dedup harian. */
const viewedKey = 'festify_viewed'
export async function recordView(eventId) {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const seen = JSON.parse(sessionStorage.getItem(viewedKey) || '{}')
    if (seen[eventId] === today) return
    seen[eventId] = today
    sessionStorage.setItem(viewedKey, JSON.stringify(seen))
  } catch { /* storage tidak tersedia */ }
  const row = db.dailyStats.find((d) => d.event_id === eventId && d.stat_date === new Date().toISOString().slice(0, 10))
  if (row) row.views += 1
}

/** Pencatatan klik tiket — di Supabase: RPC record_ticket_click(event_id). */
export async function recordTicketClick(eventId) {
  const row = db.dailyStats.find((d) => d.event_id === eventId && d.stat_date === new Date().toISOString().slice(0, 10))
  if (row) row.ticket_clicks += 1
}

/* ================= Organizer ================= */

export async function listMyEvents(organizerId, { status = '', q = '' } = {}) {
  await delay()
  return db.events
    .filter((e) => (organizerId ? e.organizer_id === organizerId : true))
    .filter((e) => (status === 'archived' ? e.archived_at : !e.archived_at && (!status || e.status === status)))
    .filter((e) => !q || e.title.toLowerCase().includes(q.toLowerCase()))
    .map(hydrateEvent)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
}

export async function getEventForEdit(id, organizerId) {
  await delay()
  const e = db.events.find((x) => x.id === id && (!organizerId || x.organizer_id === organizerId))
  if (!e) return null
  return {
    ...e,
    schedules: db.schedules.filter((s) => s.event_id === id).sort((a, b) => a.sort_order - b.sort_order),
    performers: db.performers.filter((p) => p.event_id === id).sort((a, b) => a.sort_order - b.sort_order),
    media: db.media.filter((m) => m.event_id === id).sort((a, b) => a.sort_order - b.sort_order),
  }
}

/** Kelengkapan sebelum publish (REQ-BR-0.6, BR-0.7). Validasi yang sama juga dipasang di trigger database. */
export const publishChecklist = (e) => [
  { key: 'title', label: 'Judul acara', ok: !!e.title?.trim() },
  { key: 'description', label: 'Deskripsi (min. 50 karakter)', ok: (e.description?.trim().length || 0) >= 50 },
  { key: 'category', label: 'Kategori event', ok: !!e.category_id },
  { key: 'region', label: 'Wilayah', ok: !!e.region_id },
  { key: 'date', label: 'Tanggal & waktu pelaksanaan', ok: !!e.start_date && (!e.end_date || new Date(e.end_date) >= new Date(e.start_date)) },
  { key: 'venue', label: 'Venue & alamat', ok: !!e.venue_name?.trim() && !!e.address?.trim() },
  { key: 'location', label: 'Titik lokasi peta', ok: e.latitude != null && e.longitude != null },
  { key: 'performers', label: 'Minimal 1 pengisi acara', ok: (e.performers?.length || 0) > 0 },
  { key: 'schedules', label: 'Minimal 1 rundown', ok: (e.schedules?.length || 0) > 0 },
  { key: 'ticket', label: 'Link tiket resmi (https)', ok: /^https:\/\//.test(e.ticket_url || '') },
  { key: 'poster', label: 'Poster utama', ok: !!e.poster_url },
]

export async function saveEvent(organizerId, input) {
  await delay(400)
  const slug = slugify(input.slug || input.title)
  if (!input.title?.trim()) throw new ServiceError('Judul event wajib diisi.')
  if (db.events.some((e) => e.slug === slug && e.id !== input.id)) throw new ServiceError('Slug sudah dipakai event lain. Ubah slug.')
  if (input.status === 'published' && publishChecklist(input).some((c) => !c.ok)) throw new ServiceError('Lengkapi semua data wajib sebelum menerbitkan event.')
  const { schedules = [], performers = [], media = [], ...fields } = input
  const id = input.id || uid('e')
  const existing = db.events.find((e) => e.id === id)
  if (existing && existing.organizer_id !== organizerId && organizerId) throw new ServiceError('Anda tidak berhak mengubah event ini.', 'forbidden')
  const row = {
    ...(existing || { created_at: nowIso(), organizer_id: organizerId, archived_at: null }),
    ...fields,
    id,
    slug,
    ticket_price_min: fields.ticket_price_min === '' ? 0 : Number(fields.ticket_price_min ?? 0),
    ticket_price_max: fields.ticket_price_max === '' || fields.ticket_price_max == null ? null : Number(fields.ticket_price_max),
    updated_at: nowIso(),
  }
  if (existing) Object.assign(existing, row)
  else {
    db.events.push(row)
    for (let i = 0; i < 30; i++) db.dailyStats.push({ event_id: id, stat_date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10), views: 0, ticket_clicks: 0, favorites: 0, reviews: 0 })
  }
  db.schedules = [...db.schedules.filter((s) => s.event_id !== id), ...schedules.map((s, i) => ({ ...s, id: s.id || uid('s'), event_id: id, sort_order: i }))]
  db.performers = [...db.performers.filter((p) => p.event_id !== id), ...performers.map((p, i) => ({ ...p, id: p.id || uid('p'), event_id: id, sort_order: i }))]
  db.media = [...db.media.filter((m) => m.event_id !== id), ...media.map((m, i) => ({ ...m, id: m.id || uid('m'), event_id: id, sort_order: i }))]
  return row
}

export async function setEventStatus(id, organizerId, status, reason) {
  await delay()
  const e = db.events.find((x) => x.id === id && (!organizerId || x.organizer_id === organizerId))
  if (!e) throw new ServiceError('Event tidak ditemukan.')
  if (status === 'published' && publishChecklist({ ...e, schedules: db.schedules.filter((s) => s.event_id === id), performers: db.performers.filter((p) => p.event_id === id) }).some((c) => !c.ok)) {
    throw new ServiceError('Event belum lengkap. Buka form edit untuk melengkapi data wajib.')
  }
  e.status = status
  if (status === 'cancelled') e.cancel_reason = reason || null
  e.updated_at = nowIso()
}

export async function archiveEvent(id, organizerId, archive = true) {
  await delay()
  const e = db.events.find((x) => x.id === id && (!organizerId || x.organizer_id === organizerId))
  if (!e) throw new ServiceError('Event tidak ditemukan.')
  e.archived_at = archive ? nowIso() : null
}

/** Hapus permanen hanya diperbolehkan untuk draft tanpa interaksi (atau admin). */
export async function deleteEvent(id, { asAdmin = false, organizerId } = {}) {
  await delay()
  const e = db.events.find((x) => x.id === id)
  if (!e) throw new ServiceError('Event tidak ditemukan.')
  const hasInteraction = db.reviews.some((r) => r.event_id === id) || db.favorites.some((f) => f.event_id === id)
  if (!asAdmin && (e.organizer_id !== organizerId || e.status !== 'draft' || hasInteraction)) {
    throw new ServiceError('Hanya draft tanpa ulasan/favorit yang bisa dihapus. Gunakan Arsipkan untuk event lainnya.')
  }
  db.events = db.events.filter((x) => x.id !== id)
}
