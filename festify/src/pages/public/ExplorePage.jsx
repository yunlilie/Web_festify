import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, SearchX } from 'lucide-react'
import FilterPanel from '@/components/event/FilterPanel'
import EventCard from '@/components/event/EventCard'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'
import { EventGridSkeleton, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listEvents } from '@/services/eventService'
import { listCategories, listRegions } from '@/services/catalogService'
import { DATE_PRESETS, PAGE_SIZE, SORT_OPTIONS } from '@/utils/constants'
import { formatNumber } from '@/utils/format'

const KEYS = ['q', 'category', 'region', 'date', 'from', 'to', 'min', 'max', 'sort', 'page']

export default function ExplorePage() {
  useDocumentTitle('Jelajahi event')
  const [params, setParams] = useSearchParams()
  const values = useMemo(() => Object.fromEntries(KEYS.map((k) => [k, params.get(k) || ''])), [params])
  const page = Number(values.page) || 1
  const [q, setQ] = useState(values.q)
  const dq = useDebounce(q, 400)
  const [showFilter, setShowFilter] = useState(false)

  const cats = useAsync(listCategories, [])
  const regions = useAsync(listRegions, [])

  const update = (patch, resetPage = true) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, String(v))))
    if (resetPage && !('page' in patch)) next.delete('page')
    setParams(next, { replace: !('page' in patch) })
  }

  useEffect(() => {
    if (dq !== values.q) update({ q: dq.trim() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq])
  useEffect(() => { setQ(values.q) }, [values.q])

  const result = useAsync(() => listEvents({ ...values, page }), [params.toString()])

  const chips = [
    values.q && { key: 'q', label: `“${values.q}”` },
    values.category && { key: 'category', label: cats.data?.find((c) => c.slug === values.category)?.name || values.category },
    values.region && { key: 'region', label: regions.data?.find((r) => r.slug === values.region)?.city || values.region },
    values.date && { key: 'date', label: DATE_PRESETS.find((d) => d.value === values.date)?.label, also: ['from', 'to'] },
    (values.min || values.max) && { key: 'min', label: values.max === '0' ? 'Gratis' : `Rp ${values.min || 0} – ${values.max || '∞'}`, also: ['max'] },
  ].filter(Boolean)

  const reset = () => {
    setQ('')
    setParams(new URLSearchParams(values.sort ? { sort: values.sort } : {}))
  }

  return (
    <div className="container">
      <header className="explore-head">
        <h1>Jelajahi event</h1>
        <p className="text-muted" style={{ marginTop: 6 }}>Cari berdasarkan judul atau deskripsi, lalu saring sesuai kebutuhanmu.</p>
        <div className="row" style={{ marginTop: 'var(--sp-5)' }}>
          <div className="input-icon grow" style={{ maxWidth: 560 }}>
            <Search aria-hidden="true" />
            <input className="input" type="search" placeholder="Contoh: jazz, workshop desain, pameran seni" aria-label="Cari event" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button variant="secondary" className="filter-toggle" onClick={() => setShowFilter((s) => !s)} aria-expanded={showFilter}>
            <SlidersHorizontal /> Filter{chips.length ? ` (${chips.length})` : ''}
          </Button>
        </div>
      </header>

      <div className="explore-layout">
        <FilterPanel values={values} categories={cats.data} regions={regions.data} onChange={update} onReset={reset} collapsed={!showFilter} />

        <section aria-live="polite" aria-busy={result.loading}>
          <div className="toolbar">
            <span className="text-sm text-muted">
              {result.loading ? 'Mencari…' : `${formatNumber(result.data?.count || 0)} event ditemukan`}
            </span>
            <label className="row" style={{ gap: 8 }}>
              <span className="text-sm">Urutkan</span>
              <select className="select" value={values.sort || 'upcoming'} onChange={(e) => update({ sort: e.target.value === 'upcoming' ? '' : e.target.value })}>
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="active-filters">
              {chips.map((c) => (
                <button key={c.key} type="button" onClick={() => { if (c.key === 'q') setQ(''); update(Object.fromEntries([c.key, ...(c.also || [])].map((k) => [k, '']))) }} aria-label={`Hapus filter ${c.label}`}>
                  {c.label} <X aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          {result.loading ? (
            <EventGridSkeleton count={6} />
          ) : result.error ? (
            <ErrorState message={result.error} onRetry={result.reload} />
          ) : !result.data.count ? (
            <EmptyState icon={SearchX} title="Event tidak ditemukan" description="Coba kata kunci lain, perluas rentang tanggal, atau hapus beberapa filter." action={<Button variant="secondary" onClick={reset}>Hapus semua filter</Button>} />
          ) : (
            <div className="stack-lg">
              <div className="event-grid">
                {result.data.data.map((e, i) => <EventCard key={e.id} event={e} eager={i < 3} />)}
              </div>
              <Pagination page={page} pageSize={PAGE_SIZE} total={result.data.count} onChange={(p) => { update({ page: p === 1 ? '' : p }, false); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
