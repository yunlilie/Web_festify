import { useState } from 'react'
import { Star } from 'lucide-react'

const LABELS = ['', 'Buruk', 'Kurang', 'Cukup', 'Bagus', 'Luar biasa']

export function Stars({ value = 0, size }) {
  const v = Math.round(value)
  return (
    <span className="stars" role="img" aria-label={`Rating ${value} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={i <= v ? 'is-on' : ''} style={size ? { width: size, height: size } : undefined} aria-hidden="true" />
      ))}
    </span>
  )
}

export function StarInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="row">
      <div className="stars stars--input" role="radiogroup" aria-label="Pilih rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} bintang — ${LABELS[i]}`}
            disabled={disabled}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
          >
            <Star className={i <= shown ? 'is-on' : ''} aria-hidden="true" />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted">{LABELS[shown] || 'Belum dipilih'}</span>
    </div>
  )
}
