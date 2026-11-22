import { Link } from 'react-router-dom'

/**
 * Logo Festify: simbol gelombang (logo-mark.png) + wordmark teks.
 * logo.png (dengan tulisan FESTIFY) tetap tersedia untuk kebutuhan cetak/OG image.
 */
export default function Logo({ to = '/', showText = true }) {
  return (
    <Link to={to} className="logo" aria-label="Festify — Beranda">
      <img src="/logo-mark.png" alt="" width="45" height="21" />
      {showText && <span>Festify</span>}
    </Link>
  )
}
