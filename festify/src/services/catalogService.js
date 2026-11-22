// Kategori & wilayah. Tahap 4: diganti query supabase.from('categories'|'regions').
import { db, delay, ServiceError } from './preview/db'
import { slugify } from '@/utils/slugify'

export async function listCategories() {
  await delay(120)
  return [...db.categories].sort((a, b) => a.name.localeCompare(b.name))
}

export async function listRegions() {
  await delay(120)
  return [...db.regions].sort((a, b) => a.province.localeCompare(b.province) || a.city.localeCompare(b.city))
}

export async function saveCategory(input) {
  await delay()
  const name = input.name?.trim()
  if (!name) throw new ServiceError('Nama kategori wajib diisi.')
  const slug = slugify(input.slug || name)
  if (db.categories.some((c) => c.slug === slug && c.id !== input.id)) throw new ServiceError('Slug kategori sudah dipakai.')
  if (input.id) {
    Object.assign(db.categories.find((c) => c.id === input.id), { name, slug, description: input.description || null })
  } else {
    db.categories.push({ id: Math.max(0, ...db.categories.map((c) => c.id)) + 1, name, slug, description: input.description || null, icon: 'Sparkles', color: '#6a0dad' })
  }
}

export async function deleteCategory(id) {
  await delay()
  if (db.events.some((e) => e.category_id === id)) throw new ServiceError('Kategori masih dipakai oleh event. Pindahkan event terlebih dahulu.')
  db.categories = db.categories.filter((c) => c.id !== id)
}

export async function saveRegion(input) {
  await delay()
  if (!input.province?.trim() || !input.city?.trim()) throw new ServiceError('Provinsi dan kota wajib diisi.')
  const slug = slugify(input.slug || [input.city, input.district].filter(Boolean).join(' '))
  if (db.regions.some((r) => r.slug === slug && r.id !== input.id)) throw new ServiceError('Slug wilayah sudah dipakai.')
  const row = { province: input.province.trim(), city: input.city.trim(), district: input.district?.trim() || null, slug }
  if (input.id) Object.assign(db.regions.find((r) => r.id === input.id), row)
  else db.regions.push({ id: Math.max(0, ...db.regions.map((r) => r.id)) + 1, ...row })
}

export async function deleteRegion(id) {
  await delay()
  if (db.events.some((e) => e.region_id === id)) throw new ServiceError('Wilayah masih dipakai oleh event.')
  db.regions = db.regions.filter((r) => r.id !== id)
}
