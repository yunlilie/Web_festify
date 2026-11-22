// Favorit. Tahap 4: supabase.from('favorites') dengan RLS user_id = auth.uid().
import { db, delay, uid, nowIso, hydrateEvent } from './preview/db'

export async function listFavoriteIds(userId) {
  await delay(80)
  return new Set(db.favorites.filter((f) => f.user_id === userId).map((f) => f.event_id))
}

export async function listFavorites(userId) {
  await delay()
  return db.favorites
    .filter((f) => f.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((f) => db.events.find((e) => e.id === f.event_id))
    .filter(Boolean)
    .map(hydrateEvent)
}

export async function toggleFavorite(userId, eventId) {
  await delay(160)
  const idx = db.favorites.findIndex((f) => f.user_id === userId && f.event_id === eventId)
  if (idx >= 0) {
    db.favorites.splice(idx, 1)
    return false
  }
  db.favorites.push({ id: uid('f'), user_id: userId, event_id: eventId, created_at: nowIso() })
  return true
}
