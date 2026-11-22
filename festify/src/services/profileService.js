// Profil user & organizer. Tahap 4: supabase.from('profiles') / ('organizer_profiles') + Storage bucket `avatars`.
import { db, delay, ServiceError } from './preview/db'

export async function getProfile(userId) {
  await delay(120)
  return db.profiles.find((p) => p.id === userId) || null
}

export async function updateProfile(userId, { full_name, avatar_url }) {
  await delay(300)
  const name = (full_name || '').trim()
  if (name.length < 2) throw new ServiceError('Nama minimal 2 karakter.')
  const p = db.profiles.find((x) => x.id === userId)
  if (!p) throw new ServiceError('Profil tidak ditemukan.')
  // role sengaja tidak bisa diubah dari sini.
  p.full_name = name
  if (avatar_url !== undefined) p.avatar_url = avatar_url
  return { ...p }
}

export async function getOrganizerProfile(userId) {
  await delay(120)
  const org = db.organizerProfiles.find((o) => o.user_id === userId)
  const p = db.profiles.find((x) => x.id === userId)
  return org && p ? { ...org, email: p.email, full_name: p.full_name } : null
}

export async function updateOrganizerProfile(userId, input) {
  await delay(300)
  if (!input.organization_name?.trim()) throw new ServiceError('Nama organizer wajib diisi.')
  let org = db.organizerProfiles.find((o) => o.user_id === userId)
  if (!org) {
    org = { user_id: userId }
    db.organizerProfiles.push(org)
  }
  Object.assign(org, {
    organization_name: input.organization_name.trim(),
    bio: input.bio?.trim() || '',
    phone: input.phone?.trim() || '',
    website_url: input.website_url?.trim() || '',
    instagram: input.instagram?.trim() || '',
    logo_url: input.logo_url ?? org.logo_url ?? null,
  })
}

/** User yang sudah ada mengaktifkan akun organizer (tanpa persetujuan admin, sesuai keputusan).
 * Tahap 4: RPC become_organizer(...) — hanya bisa user → organizer, tidak pernah → admin. */
export async function becomeOrganizer(userId, input) {
  await updateOrganizerProfile(userId, input)
  const p = db.profiles.find((x) => x.id === userId)
  if (p.role === 'user') p.role = 'organizer'
  return { ...p }
}
