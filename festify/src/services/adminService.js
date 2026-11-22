// Manajemen pengguna & organizer oleh admin.
// Tahap 4: perubahan role HANYA lewat RPC admin_set_role(user_id, role) (security definer + cek is_admin()).
import { db, delay, ServiceError } from './preview/db'

export async function listUsers({ q = '', role = '' } = {}) {
  await delay()
  return db.profiles
    .filter((p) => !role || p.role === role)
    .filter((p) => !q || `${p.full_name} ${p.email}`.toLowerCase().includes(q.toLowerCase()))
    .map((p) => ({ ...p, organizer: db.organizerProfiles.find((o) => o.user_id === p.id) || null, events: db.events.filter((e) => e.organizer_id === p.id).length }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function setUserRole(actorId, userId, role) {
  await delay()
  if (actorId === userId) throw new ServiceError('Anda tidak dapat mengubah role akun sendiri.')
  if (!['user', 'organizer', 'admin'].includes(role)) throw new ServiceError('Role tidak valid.')
  const p = db.profiles.find((x) => x.id === userId)
  if (!p) throw new ServiceError('Pengguna tidak ditemukan.')
  p.role = role
  if (role === 'organizer' && !db.organizerProfiles.some((o) => o.user_id === userId)) {
    db.organizerProfiles.push({ user_id: userId, organization_name: p.full_name, bio: '', phone: '', website_url: '', instagram: '', logo_url: null })
  }
}

export async function listOrganizers({ q = '' } = {}) {
  await delay()
  return db.profiles
    .filter((p) => p.role === 'organizer')
    .map((p) => {
      const org = db.organizerProfiles.find((o) => o.user_id === p.id) || {}
      const evs = db.events.filter((e) => e.organizer_id === p.id)
      return { ...p, ...org, id: p.id, total_events: evs.length, published: evs.filter((e) => e.status === 'published').length }
    })
    .filter((o) => !q || `${o.organization_name} ${o.email}`.toLowerCase().includes(q.toLowerCase()))
}
