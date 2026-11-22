import { FILE_RULES } from './constants'

export const isEmail = (v = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

export const isHttpsUrl = (v = '') => {
  try {
    const u = new URL(v.trim())
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export const passwordIssues = (pw = '') => {
  const issues = []
  if (pw.length < 8) issues.push('minimal 8 karakter')
  if (!/[A-Za-z]/.test(pw)) issues.push('mengandung huruf')
  if (!/\d/.test(pw)) issues.push('mengandung angka')
  return issues
}

/** Menjalankan aturan per field. rules: { field: [(value, values) => pesan|null] } */
export const validate = (values, rules) => {
  const errors = {}
  for (const [field, checks] of Object.entries(rules)) {
    for (const check of checks) {
      const msg = check(values[field], values)
      if (msg) {
        errors[field] = msg
        break
      }
    }
  }
  return errors
}

export const required = (label) => (v) =>
  v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length) ? `${label} wajib diisi.` : null

export const maxLen = (n, label) => (v) => (v && v.length > n ? `${label} maksimal ${n} karakter.` : null)
export const minLen = (n, label) => (v) => (v && v.trim().length < n ? `${label} minimal ${n} karakter.` : null)

/** Validasi file sisi klien. Validasi final tetap di Storage policy / bucket config. */
export const validateFile = (file, kind = 'image') => {
  const rule = FILE_RULES[kind]
  if (!file) return 'File belum dipilih.'
  if (!rule.types.includes(file.type)) return `Format tidak didukung. Gunakan ${rule.label}.`
  if (file.size > rule.maxBytes) return `Ukuran maksimal ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`
  return null
}
