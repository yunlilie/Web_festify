// Notifikasi. Pembuatan notifikasi terjadi di backend (trigger / RPC security definer).
// Frontend hanya membaca dan menandai is_read.
import { db, delay, uid, nowIso, ServiceError } from './preview/db'

export async function listNotifications(userId) {
  await delay()
  return db.notifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function countUnread(userId) {
  await delay(60)
  return db.notifications.filter((n) => n.user_id === userId && !n.is_read).length
}

export async function markRead(userId, id) {
  await delay(100)
  const n = db.notifications.find((x) => x.id === id && x.user_id === userId)
  if (n) n.is_read = true
}

export async function markAllRead(userId) {
  await delay(150)
  db.notifications.forEach((n) => {
    if (n.user_id === userId) n.is_read = true
  })
}

/** Admin: kirim pengumuman. Tahap 4: RPC admin_broadcast(title, message, audience). */
export async function broadcast({ title, message, audience }) {
  await delay(400)
  if (!title?.trim() || !message?.trim()) throw new ServiceError('Judul dan isi pengumuman wajib diisi.')
  const targets = db.profiles.filter((p) => audience === 'all' || p.role === audience)
  const created = nowIso()
  targets.forEach((p) => db.notifications.push({ id: uid('n'), user_id: p.id, title: title.trim(), message: message.trim(), notification_type: 'announcement', reference_id: null, is_read: false, created_at: created }))
  return targets.length
}

export async function listAnnouncements() {
  await delay()
  const seen = new Map()
  db.notifications
    .filter((n) => n.notification_type === 'announcement')
    .forEach((n) => {
      const key = `${n.title}|${n.created_at}`
      const cur = seen.get(key) || { ...n, recipients: 0 }
      cur.recipients += 1
      seen.set(key, cur)
    })
  return [...seen.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}
