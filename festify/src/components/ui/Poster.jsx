import { useState } from 'react'

const PALETTES = [
  ['#6a0dad', '#be3496', '#ffa94d'],
  ['#be3496', '#f43f5e', '#ffc27a'],
  ['#2a0a45', '#6a0dad', '#f43f5e'],
  ['#f28c1c', '#f43f5e', '#6a0dad'],
  ['#1c1326', '#be3496', '#ffa94d'],
  ['#d92d4c', '#8433cc', '#ffd8a8'],
]

const hash = (s = '') => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

/** Poster event. Bila poster belum ada / gagal dimuat, tampilkan artwork generatif yang konsisten per judul. */
export default function Poster({ src, title, meta, eager }) {
  const [failed, setFailed] = useState(false)
  if (src && !failed) {
    return (
      <div className="poster">
        <img src={src} alt={`Poster ${title}`} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
      </div>
    )
  }
  const h = hash(title)
  const [a, b, c] = PALETTES[h % PALETTES.length]
  const x = 15 + (h % 60)
  const y = 10 + ((h >> 3) % 40)
  return (
    <div className="poster" role="img" aria-label={`Poster ${title}`}>
      <div
        className="poster-art"
        style={{
          background: `radial-gradient(70% 55% at ${x}% ${y}%, ${c} 0%, transparent 70%), radial-gradient(80% 60% at ${100 - x}% 90%, ${b} 0%, transparent 72%), ${a}`,
        }}
      >
        <svg viewBox="0 0 100 40" style={{ position: 'absolute', top: '12%', left: '10%', width: '45%', opacity: 0.35 }} aria-hidden="true">
          <path d="M0 30 Q 25 0 50 20 T 100 10" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </svg>
        {meta && <span className="poster-art__meta">{meta}</span>}
        <span className="poster-art__title">{title}</span>
      </div>
    </div>
  )
}
