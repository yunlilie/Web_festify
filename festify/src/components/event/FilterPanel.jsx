import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Input, Select } from '../ui/Field'
import Button from '../ui/Button'
import { DATE_PRESETS } from '@/utils/constants'

/** Panel filter Explore. Nilai disimpan di URL (lihat ExplorePage). */
export default function FilterPanel({ values, categories = [], regions = [], onChange, onReset, collapsed }) {
  const [price, setPrice] = useState({ min: values.min || '', max: values.max || '' })
  const [priceErr, setPriceErr] = useState('')

  useEffect(() => { setPrice({ min: values.min || '', max: values.max || '' }) }, [values.min, values.max])

  const applyPrice = () => {
    if (price.min !== '' && price.max !== '' && Number(price.min) > Number(price.max)) {
      setPriceErr('Harga minimum tidak boleh lebih besar dari maksimum.')
      return
    }
    setPriceErr('')
    onChange({ min: price.min, max: price.max })
  }

  const provinces = [...new Set(regions.map((r) => r.province))]

  return (
    <aside className={`filter-panel card ${collapsed ? 'is-collapsed' : ''}`} aria-label="Filter event">
      <div className="row-between">
        <strong>Filter</strong>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw /> Reset
        </Button>
      </div>

      <div className="filter-panel__group">
        <span className="filter-panel__title">Kategori</span>
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="chip" aria-pressed={!values.category} onClick={() => onChange({ category: '' })}>Semua</button>
          {categories.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={values.category === c.slug} onClick={() => onChange({ category: values.category === c.slug ? '' : c.slug })}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <Select label="Wilayah" value={values.region || ''} onChange={(e) => onChange({ region: e.target.value })}>
        <option value="">Semua wilayah Jabodetabek</option>
        {provinces.map((p) => (
          <optgroup key={p} label={p}>
            {regions.filter((r) => r.province === p).map((r) => (
              <option key={r.id} value={r.slug}>{[r.district, r.city].filter(Boolean).join(', ')}</option>
            ))}
          </optgroup>
        ))}
      </Select>

      <Select label="Tanggal" value={values.date || ''} onChange={(e) => onChange({ date: e.target.value, ...(e.target.value !== 'custom' ? { from: '', to: '' } : {}) })}>
        {DATE_PRESETS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </Select>
      {values.date === 'custom' && (
        <div className="form-grid form-grid--2">
          <Input type="date" label="Dari" value={values.from || ''} onChange={(e) => onChange({ from: e.target.value })} />
          <Input type="date" label="Sampai" value={values.to || ''} min={values.from || undefined} onChange={(e) => onChange({ to: e.target.value })} />
        </div>
      )}

      <div className="filter-panel__group">
        <span className="filter-panel__title">Rentang harga (Rp)</span>
        <div className="form-grid form-grid--2">
          <Input type="number" min="0" step="1000" inputMode="numeric" placeholder="Min" aria-label="Harga minimum" value={price.min} onChange={(e) => setPrice((p) => ({ ...p, min: e.target.value }))} onBlur={applyPrice} onKeyDown={(e) => e.key === 'Enter' && applyPrice()} />
          <Input type="number" min="0" step="1000" inputMode="numeric" placeholder="Maks" aria-label="Harga maksimum" value={price.max} onChange={(e) => setPrice((p) => ({ ...p, max: e.target.value }))} onBlur={applyPrice} onKeyDown={(e) => e.key === 'Enter' && applyPrice()} />
        </div>
        {priceErr && <span className="field__error" role="alert">{priceErr}</span>}
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="chip" aria-pressed={values.max === '0'} onClick={() => onChange({ min: '', max: values.max === '0' ? '' : '0' })}>Gratis</button>
          <button type="button" className="chip" aria-pressed={values.max === '100000' && !values.min} onClick={() => onChange({ min: '', max: '100000' })}>≤ 100rb</button>
          <button type="button" className="chip" aria-pressed={values.min === '100000' && values.max === '500000'} onClick={() => onChange({ min: '100000', max: '500000' })}>100–500rb</button>
        </div>
      </div>
    </aside>
  )
}
