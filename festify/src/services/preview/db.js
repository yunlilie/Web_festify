/**
 * Penyimpanan in-memory untuk mode pratinjau (Tahap 2).
 * Meniru bentuk respons Supabase: { data, error, count }.
 * DIHAPUS pada Tahap 4.
 */
import * as fx from './fixtures'

const clone = (v) => structuredClone(v)

export const db = {
  categories: clone(fx.categories),
  regions: clone(fx.regions),
  profiles: clone(fx.profiles),
  organizerProfiles: clone(fx.organizerProfiles),
  events: clone(fx.events),
  schedules: clone(fx.schedules),
  performers: clone(fx.performers),
  media: clone(fx.media),
  reviews: clone(fx.reviews),
  replies: clone(fx.replies),
  favorites: clone(fx.favorites),
  notifications: clone(fx.notifications),
  blockedWords: clone(fx.blockedWords),
  dailyStats: clone(fx.dailyStats),
}

export const delay = (ms = 260) => new Promise((r) => setTimeout(r, ms))
export const uid = (p = 'id') => `${p}-${Math.random().toString(36).slice(2, 10)}`
export const nowIso = () => new Date().toISOString()

export class ServiceError extends Error {
  constructor(message, code = 'error') {
    super(message)
    this.code = code
  }
}

/** Statistik agregat per event — padanan tabel event_statistics. */
export const statsFor = (eventId) => {
  const days = db.dailyStats.filter((d) => d.event_id === eventId)
  const reviews = db.reviews.filter((r) => r.event_id === eventId && r.status === 'visible')
  const total_views = days.reduce((a, d) => a + d.views, 0)
  const total_ticket_clicks = days.reduce((a, d) => a + d.ticket_clicks, 0)
  return {
    event_id: eventId,
    total_views,
    total_ticket_clicks,
    total_favorites: db.favorites.filter((f) => f.event_id === eventId).length + days.reduce((a, d) => a + d.favorites, 0),
    total_reviews: reviews.length,
    average_rating: reviews.length ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10 : 0,
  }
}

export const hydrateEvent = (e) => {
  const org = db.profiles.find((p) => p.id === e.organizer_id)
  const orgProfile = db.organizerProfiles.find((o) => o.user_id === e.organizer_id)
  return {
    ...e,
    category: db.categories.find((c) => c.id === e.category_id) || null,
    region: db.regions.find((r) => r.id === e.region_id) || null,
    organizer: org ? { id: org.id, full_name: orgProfile?.organization_name || org.full_name, avatar_url: orgProfile?.logo_url || org.avatar_url } : null,
    statistics: statsFor(e.id),
  }
}
