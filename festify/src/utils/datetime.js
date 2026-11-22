/** Konversi antara ISO (UTC) dan nilai <input type="datetime-local"> dalam WIB (UTC+7). */
const OFFSET = 7 * 60 * 60 * 1000

export const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(new Date(iso).getTime() + OFFSET)
  return d.toISOString().slice(0, 16)
}

export const fromLocalInput = (value) => (value ? new Date(`${value}:00+07:00`).toISOString() : null)

export const timeOnly = (iso) => (iso ? toLocalInput(iso).slice(11, 16) : '')

/** Gabungkan tanggal event dengan jam rundown (HH:mm, WIB). */
export const combine = (baseIso, hhmm) => {
  if (!baseIso || !hhmm) return null
  const day = toLocalInput(baseIso).slice(0, 10)
  return new Date(`${day}T${hhmm}:00+07:00`).toISOString()
}
