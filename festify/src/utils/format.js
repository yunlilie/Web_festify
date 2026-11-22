const TZ = 'Asia/Jakarta'

export const formatDate = (iso, opts = {}) =>
  iso
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ, ...opts }).format(new Date(iso))
    : '-'

export const formatShortDate = (iso) => formatDate(iso, { day: 'numeric', month: 'short', year: undefined })

export const formatTime = (iso) =>
  iso ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(new Date(iso)) : '-'

export const formatDateRange = (start, end) => {
  if (!start) return '-'
  if (!end) return formatDate(start)
  const s = new Date(start)
  const e = new Date(end)
  const same = (o) => new Intl.DateTimeFormat('id-ID', { ...o, timeZone: TZ }).format(s) === new Intl.DateTimeFormat('id-ID', { ...o, timeZone: TZ }).format(e)
  if (same({ day: 'numeric', month: 'numeric', year: 'numeric' })) return formatDate(start, { weekday: 'long' })
  if (same({ month: 'numeric', year: 'numeric' }))
    return `${new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: TZ }).format(s)}–${formatDate(end)}`
  return `${formatDate(start, { year: undefined })} – ${formatDate(end)}`
}

export const dayMonth = (iso) => {
  const d = new Date(iso)
  return {
    day: new Intl.DateTimeFormat('id-ID', { day: '2-digit', timeZone: TZ }).format(d),
    month: new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: TZ }).format(d).replace('.', ''),
  }
}

const rupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const formatPrice = (min, max) => {
  const lo = Number(min ?? 0)
  const hi = max == null ? null : Number(max)
  if (!lo && !hi) return 'Gratis'
  if (hi && hi > lo) return lo ? `${rupiah(lo)} – ${rupiah(hi)}` : `Gratis – ${rupiah(hi)}`
  return rupiah(lo || hi)
}

export const formatPriceFrom = (min, max) => {
  const lo = Number(min ?? 0)
  if (!lo && !Number(max ?? 0)) return 'Gratis'
  return lo ? `Mulai ${rupiah(lo)}` : 'Gratis'
}

export const formatNumber = (n) => new Intl.NumberFormat('id-ID').format(n ?? 0)

export const formatCompact = (n) =>
  new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n ?? 0)

export const formatPercent = (n) => `${(n ?? 0).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`

export const timeAgo = (iso) => {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const rtf = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })
  const steps = [
    [60, 'second'],
    [3600, 'minute', 60],
    [86400, 'hour', 3600],
    [604800, 'day', 86400],
    [2629800, 'week', 604800],
    [31557600, 'month', 2629800],
    [Infinity, 'year', 31557600],
  ]
  for (const [limit, unit, div = 1] of steps) {
    if (Math.abs(diff) < limit) return rtf.format(-Math.round(diff / div), unit)
  }
  return ''
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'F'

export const regionLabel = (r) => (r ? [r.district, r.city].filter(Boolean).join(', ') : '-')

export const mapsDirectionsUrl = (lat, lng, label) =>
  lat != null && lng != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || '')}`

export const mapsEmbedUrl = (lat, lng, label, apiKey) => {
  if (apiKey && lat != null) return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`
  const q = lat != null ? `${lat},${lng}` : encodeURIComponent(label || '')
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`
}

export const youtubeEmbed = (url = '') => {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}
