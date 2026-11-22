import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Sparkles, MapPin } from 'lucide-react'
import Button from '@/components/ui/Button'
import Poster from '@/components/ui/Poster'
import EventCard from '@/components/event/EventCard'
import CategoryIcon, { categoryColor } from '@/components/event/CategoryIcon'
import { EventGridSkeleton, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getHomeSections } from '@/services/eventService'
import { listCategories, listRegions } from '@/services/catalogService'
import { formatNumber } from '@/utils/format'

function Section({ kicker, title, more, children }) {
  return (
    <section className="section container">
      <div className="section__head">
        <div>
          {kicker && <span className="section__kicker">{kicker}</span>}
          <h2 className="section__title">{title}</h2>
        </div>
        {more && (
          <Link className="section__more" to={more}>
            Lihat semua <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

const Rail = ({ items }) => (
  <div className="event-rail">
    {items.map((e) => <EventCard key={e.id} event={e} />)}
  </div>
)

export default function HomePage() {
  useDocumentTitle()
  const { user } = useAuth()
  const navigate = useNavigate()
  const home = useAsync(() => getHomeSections(user?.id), [user?.id])
  const cats = useAsync(listCategories, [])
  const regions = useAsync(listRegions, [])
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (region) params.set('region', region)
    navigate(`/explore${params.toString() ? `?${params}` : ''}`)
  }

  const d = home.data
  const heroPosters = d?.popular.slice(0, 3) || []

  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden="true" />
        <div className="container hero__grid">
          <div>
            <span className="hero__eyebrow"><Sparkles aria-hidden="true" /> Direktori event Jabodetabek</span>
            <h1>Akhir pekanmu butuh <em>cerita baru.</em></h1>
            <p className="hero__lead">Temukan konser, workshop, pameran, dan festival — lihat poster, rundown, lokasi, dan ulasan jujur sebelum memutuskan datang.</p>
            <form className="searchbar" role="search" onSubmit={submit}>
              <div className="input-icon">
                <Search aria-hidden="true" />
                <input className="input" type="search" placeholder="Cari nama event atau kata kunci" aria-label="Kata kunci" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className="select" aria-label="Wilayah" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Semua wilayah</option>
                {(regions.data || []).map((r) => <option key={r.id} value={r.slug}>{r.city}</option>)}
              </select>
              <Button type="submit" variant="accent" size="lg">Cari event</Button>
            </form>
            {d && (
              <div className="hero__stats">
                <div><b>{formatNumber(d.totalEvents)}</b><span>event aktif</span></div>
                <div><b>{d.regions.length}</b><span>wilayah</span></div>
                <div><b>{cats.data?.length || 0}</b><span>kategori</span></div>
              </div>
            )}
          </div>
          <div className="hero__stack" aria-hidden={!heroPosters.length}>
            {heroPosters.map((e, i) => (
              <Link key={e.id} to={`/events/${e.slug}`} aria-label={e.title} tabIndex={-1}>
                <Poster src={e.poster_url} title={e.title} meta={e.region?.city} eager={i === 0} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section kicker="Kategori" title="Mau ke acara apa?">
        <div className="cat-grid">
          {(cats.data || []).map((c) => (
            <Link key={c.id} to={`/explore?category=${c.slug}`} className="cat-tile">
              <span className="cat-tile__icon" style={{ background: categoryColor(c) }}><CategoryIcon slug={c.slug} /></span>
              <div>
                <strong>{c.name}</strong>
                <span>{c.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {home.loading ? (
        <section className="section container"><EventGridSkeleton count={4} /></section>
      ) : home.error ? (
        <section className="section container"><ErrorState message={home.error} onRetry={home.reload} /></section>
      ) : !d.totalEvents ? (
        <section className="section container"><EmptyState title="Belum ada event" description="Event yang diterbitkan penyelenggara akan muncul di sini." /></section>
      ) : (
        <>
          <Section kicker="Lagi ramai" title="Event populer" more="/explore?sort=popular"><Rail items={d.popular} /></Section>
          <Section kicker="Baru masuk" title="Event terbaru" more="/explore?sort=newest"><Rail items={d.latest} /></Section>
          <Section kicker="Dekat denganmu" title="Jelajahi per wilayah" more="/explore">
            <div className="region-row">
              {d.regions.map((r) => (
                <Link key={r.id} to={`/explore?region=${r.slug}`} className="region-card">
                  <div>
                    <strong>{r.city}</strong>
                    <span>{r.total} event</span>
                  </div>
                  <MapPin aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Section>
          <Section kicker={user ? 'Untukmu' : 'Pilihan editor'} title={user ? 'Rekomendasi berdasarkan favoritmu' : 'Rekomendasi event'} more="/explore?sort=rating">
            <Rail items={d.recommended} />
          </Section>
        </>
      )}

      <div className="container">
        <section className="cta-band">
          <div>
            <h2>Belum ketemu yang cocok? Jelajahi semua event.</h2>
            <p>Saring berdasarkan kategori, tanggal, wilayah, dan rentang harga — dari yang gratis sampai festival besar.</p>
          </div>
          <div className="row">
            <Button to="/explore" variant="accent" size="lg">Jelajahi event <ArrowRight /></Button>
            <Button to="/register?type=organizer" variant="secondary" size="lg">Promosikan event</Button>
          </div>
        </section>
      </div>
    </>
  )
}
