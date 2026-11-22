import { CheckCircle2, Circle } from 'lucide-react'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/States'
import { publishChecklist } from '@/services/eventService'
import { formatPrice } from '@/utils/format'

export default function StepPublish({ v, patch, set, errors }) {
  const checks = publishChecklist(v)
  const done = checks.filter((c) => c.ok).length
  return (
    <div className="stack-lg">
      <section className="stack">
        <strong>Harga tiket</strong>
        <div className="form-grid form-grid--2">
          <Input label="Harga minimum (Rp)" type="number" min="0" step="1000" inputMode="numeric" value={v.ticket_price_min} onChange={set('ticket_price_min')} error={errors.ticket_price_min} hint="Isi 0 untuk event gratis" />
          <Input label="Harga maksimum (Rp)" type="number" min="0" step="1000" inputMode="numeric" value={v.ticket_price_max ?? ''} onChange={(e) => patch({ ticket_price_max: e.target.value })} error={errors.ticket_price_max} hint="Kosongkan bila hanya satu harga" />
        </div>
        <span className="text-sm text-muted">Tampil sebagai: <strong>{formatPrice(v.ticket_price_min, v.ticket_price_max === '' ? null : v.ticket_price_max)}</strong></span>
        <Input label="URL tiket / pendaftaran resmi" required type="url" placeholder="https://…" value={v.ticket_url} onChange={set('ticket_url')} error={errors.ticket_url} hint="Wajib https dan bisa diakses publik (REQ-BR-0.9)." />
      </section>

      <section className="card" style={{ background: '#fffcfa' }}>
        <div className="card__head">
          <h3 className="card__title">Checklist sebelum terbit</h3>
          <span className="text-sm text-muted">{done}/{checks.length} lengkap</span>
        </div>
        <ul className="checklist">
          {checks.map((c) => (
            <li key={c.key} className={c.ok ? 'ok' : 'no'}>
              {c.ok ? <CheckCircle2 aria-hidden="true" /> : <Circle aria-hidden="true" />}
              <span>{c.label}</span>
              <span className="sr-only">{c.ok ? 'lengkap' : 'belum lengkap'}</span>
            </li>
          ))}
        </ul>
        {done < checks.length && (
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <Alert tone="info">Kamu tetap bisa menyimpan sebagai draft. Tombol “Terbitkan” aktif setelah semua item lengkap.</Alert>
          </div>
        )}
      </section>
    </div>
  )
}
