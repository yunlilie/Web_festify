/** Mengubah error teknis menjadi pesan yang aman ditampilkan ke pengguna. */
const MAP = {
  'Invalid login credentials': 'Email atau password salah.',
  'Email not confirmed': 'Email belum diverifikasi. Cek kotak masuk Anda.',
  'User already registered': 'Email sudah terdaftar. Silakan masuk.',
  'Failed to fetch': 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.',
}

export const friendlyError = (e) => {
  if (!e) return null
  const msg = e.message || String(e)
  if (MAP[msg]) return MAP[msg]
  // ServiceError & pesan validasi kita sudah berbahasa Indonesia dan aman.
  if (e.name === 'Error' && /^[A-Z].*[.!]$/.test(msg) && !/sql|postgres|jwt|token|relation|column/i.test(msg)) return msg
  if (import.meta.env.DEV) console.error(e)
  return 'Terjadi kesalahan. Silakan coba lagi beberapa saat lagi.'
}
