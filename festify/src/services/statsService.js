// Statistik organizer & platform. Tahap 4: view `organizer_event_stats` + tabel event_daily_stats.
import { db, delay, statsFor, hydrateEvent } from './preview/db'

const ctr = (clicks, views) => (views ? (clicks / views) * 100 : 0)

const series = (eventIds, days) => {
  const byDate = new Map()
  db.dailyStats
    .filter((d) => eventIds.has(d.event_id))
    .forEach((d) => {
      const cur = byDate.get(d.stat_date) || { date: d.stat_date, views: 0, ticket_clicks: 0, favorites: 0 }
      cur.views += d.views
      cur.ticket_clicks += d.ticket_clicks
      cur.favorites += d.favorites
      byDate.set(d.stat_date, cur)
    })
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-days)
}

export async function getOrganizerOverview(organizerId, { days = 30, eventId = '' } = {}) {
  await delay()
  const mine = db.events.filter((e) => e.organizer_id === organizerId && (!eventId || e.id === eventId))
  const ids = new Set(mine.map((e) => e.id))
  const perEvent = mine.map((e) => ({ ...hydrateEvent(e), ...statsFor(e.id) }))
  const sum = (k) => perEvent.reduce((a, e) => a + e[k], 0)
  const rated = perEvent.filter((e) => e.total_reviews)
  return {
    totals: {
      events: mine.length,
      published: mine.filter((e) => e.status === 'published').length,
      views: sum('total_views'),
      favorites: sum('total_favorites'),
      reviews: sum('total_reviews'),
      ticket_clicks: sum('total_ticket_clicks'),
      ctr: ctr(sum('total_ticket_clicks'), sum('total_views')),
      average_rating: rated.length ? rated.reduce((a, e) => a + e.average_rating * e.total_reviews, 0) / sum('total_reviews') : 0,
    },
    series: series(ids, days),
    perEvent: perEvent.map((e) => ({ ...e, ctr: ctr(e.total_ticket_clicks, e.total_views) })).sort((a, b) => b.total_views - a.total_views),
  }
}

export async function getPlatformStats({ days = 30 } = {}) {
  await delay()
  const ids = new Set(db.events.map((e) => e.id))
  const all = db.events.map((e) => statsFor(e.id))
  const views = all.reduce((a, s) => a + s.total_views, 0)
  const clicks = all.reduce((a, s) => a + s.total_ticket_clicks, 0)
  return {
    users: db.profiles.length,
    byRole: ['user', 'organizer', 'admin'].map((r) => ({ role: r, total: db.profiles.filter((p) => p.role === r).length })),
    events: db.events.length,
    byStatus: ['draft', 'published', 'cancelled', 'completed'].map((s) => ({ status: s, total: db.events.filter((e) => e.status === s).length })),
    reviews: db.reviews.length,
    hiddenReviews: db.reviews.filter((r) => r.status === 'hidden').length,
    favorites: db.favorites.length,
    views,
    clicks,
    ctr: ctr(clicks, views),
    series: series(ids, days),
    byCategory: db.categories.map((c) => ({ name: c.name, total: db.events.filter((e) => e.category_id === c.id).length })).filter((c) => c.total).sort((a, b) => b.total - a.total),
    topEvents: db.events.map(hydrateEvent).sort((a, b) => b.statistics.total_views - a.statistics.total_views).slice(0, 5),
  }
}
