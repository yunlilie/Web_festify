// Ulasan, balasan, dan moderasi.
// Tahap 4: validasi kata terlarang dipindah ke trigger `reviews_validate` (database),
// sehingga tidak bisa dilewati dari frontend. Cek di sini hanya untuk umpan balik cepat.
import { db, delay, uid, nowIso, ServiceError } from './preview/db'

const normalize = (s) => s.toLowerCase().replace(/[0@]/g, 'o').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/\$/g, 's')

export const findBlockedWord = (text = '') => {
  const t = normalize(text)
  return db.blockedWords.find((w) => new RegExp(`(^|[^a-z])${w.word.replace(/\s+/g, '\\s+')}($|[^a-z])`).test(t))?.word || null
}

const withUser = (r) => {
  const p = db.profiles.find((x) => x.id === r.user_id)
  const reply = db.replies.find((x) => x.review_id === r.id) || null
  const event = db.events.find((e) => e.id === r.event_id)
  return { ...r, user: p ? { id: p.id, full_name: p.full_name, avatar_url: p.avatar_url } : null, reply, event: event ? { id: event.id, title: event.title, slug: event.slug } : null }
}

export async function listEventReviews(eventId) {
  await delay(200)
  return db.reviews
    .filter((r) => r.event_id === eventId && r.status === 'visible')
    .map(withUser)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function submitReview(userId, eventId, { rating, comment }) {
  await delay(350)
  const r = Number(rating)
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new ServiceError('Pilih rating 1 sampai 5 bintang.')
  const text = (comment || '').trim()
  if (text.length < 10) throw new ServiceError('Ulasan minimal 10 karakter.')
  if (text.length > 1000) throw new ServiceError('Ulasan maksimal 1.000 karakter.')
  const bad = findBlockedWord(text)
  if (bad) throw new ServiceError('Ulasan tidak dapat dikirim karena mengandung kata yang tidak diperbolehkan. Gunakan bahasa yang sopan.', 'blocked_word')
  const existing = db.reviews.find((x) => x.user_id === userId && x.event_id === eventId)
  if (existing) {
    Object.assign(existing, { rating: r, comment: text, updated_at: nowIso() })
    return withUser(existing)
  }
  const row = { id: uid('r'), user_id: userId, event_id: eventId, rating: r, comment: text, status: 'visible', created_at: nowIso(), updated_at: nowIso() }
  db.reviews.push(row)
  return withUser(row)
}

export async function getMyReview(userId, eventId) {
  await delay(100)
  const r = db.reviews.find((x) => x.user_id === userId && x.event_id === eventId)
  return r ? withUser(r) : null
}

export async function deleteMyReview(userId, reviewId) {
  await delay()
  db.reviews = db.reviews.filter((r) => !(r.id === reviewId && r.user_id === userId))
}

/** Ulasan untuk event milik organizer. */
export async function listOrganizerReviews(organizerId, { eventId = '', rating = '' } = {}) {
  await delay()
  const ids = new Set(db.events.filter((e) => e.organizer_id === organizerId).map((e) => e.id))
  return db.reviews
    .filter((r) => ids.has(r.event_id) && r.status === 'visible')
    .filter((r) => !eventId || r.event_id === eventId)
    .filter((r) => !rating || r.rating === Number(rating))
    .map(withUser)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function replyToReview(organizerId, reviewId, text) {
  await delay()
  const t = (text || '').trim()
  if (t.length < 2) throw new ServiceError('Balasan tidak boleh kosong.')
  if (findBlockedWord(t)) throw new ServiceError('Balasan mengandung kata yang tidak diperbolehkan.')
  const review = db.reviews.find((r) => r.id === reviewId)
  const ev = review && db.events.find((e) => e.id === review.event_id)
  if (!ev || ev.organizer_id !== organizerId) throw new ServiceError('Anda hanya bisa membalas ulasan event milik Anda.', 'forbidden')
  const existing = db.replies.find((x) => x.review_id === reviewId)
  if (existing) Object.assign(existing, { reply: t, updated_at: nowIso() })
  else db.replies.push({ id: uid('rr'), review_id: reviewId, organizer_id: organizerId, reply: t, created_at: nowIso(), updated_at: nowIso() })
}

export async function deleteReply(organizerId, reviewId) {
  await delay()
  db.replies = db.replies.filter((x) => !(x.review_id === reviewId && x.organizer_id === organizerId))
}

/* ================= Admin moderation ================= */
export async function listAllReviews({ status = '', q = '' } = {}) {
  await delay()
  return db.reviews
    .filter((r) => !status || r.status === status)
    .map(withUser)
    .filter((r) => !q || `${r.comment} ${r.user?.full_name} ${r.event?.title}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function setReviewStatus(reviewId, status) {
  await delay()
  const r = db.reviews.find((x) => x.id === reviewId)
  if (r) r.status = status
}

export async function adminDeleteReview(reviewId) {
  await delay()
  db.reviews = db.reviews.filter((r) => r.id !== reviewId)
  db.replies = db.replies.filter((r) => r.review_id !== reviewId)
}

/* ================= Blocked words ================= */
export async function listBlockedWords() {
  await delay(150)
  return [...db.blockedWords].sort((a, b) => a.word.localeCompare(b.word))
}
export async function addBlockedWord(word) {
  await delay()
  const w = word.trim().toLowerCase()
  if (w.length < 2) throw new ServiceError('Kata minimal 2 huruf.')
  if (db.blockedWords.some((x) => x.word === w)) throw new ServiceError('Kata sudah ada di daftar.')
  db.blockedWords.push({ id: Date.now(), word: w, created_at: nowIso() })
}
export async function removeBlockedWord(id) {
  await delay()
  db.blockedWords = db.blockedWords.filter((w) => w.id !== id)
}
