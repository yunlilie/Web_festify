import { AlertTriangle, SearchX } from 'lucide-react'
import Button from './Button'

export function Spinner({ label = 'Memuat…' }) {
  return (
    <div className="state state--compact" role="status">
      <span className="spinner spinner--lg" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon = SearchX, title, description, action, compact }) {
  return (
    <div className={`state ${compact ? 'state--compact' : ''}`}>
      <div className="state__icon"><Icon aria-hidden="true" /></div>
      <h3 className="state__title">{title}</h3>
      {description && <p className="state__desc">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry, compact }) {
  return (
    <div className={`state state--error ${compact ? 'state--compact' : ''}`} role="alert">
      <div className="state__icon"><AlertTriangle aria-hidden="true" /></div>
      <h3 className="state__title">Gagal memuat data</h3>
      <p className="state__desc">{message || 'Terjadi kesalahan. Silakan coba lagi.'}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Coba lagi</Button>}
    </div>
  )
}

export function EventGridSkeleton({ count = 8 }) {
  return (
    <div className="event-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="stack-sm">
          <div className="skeleton skeleton--poster" />
          <div className="skeleton skeleton--line" style={{ width: '80%' }} />
          <div className="skeleton skeleton--line" style={{ width: '50%' }} />
        </div>
      ))}
    </div>
  )
}

export function LinesSkeleton({ rows = 4 }) {
  return (
    <div className="stack-sm" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton skeleton--line" style={{ width: `${90 - i * 12}%`, height: 16 }} />
      ))}
    </div>
  )
}

export function Alert({ tone = 'error', icon: Icon = AlertTriangle, children }) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
