import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, Navigation, Heart, Share2, Star, Ticket, ExternalLink, Info, Mic2, ChevronRight, AlertTriangle } from 'lucide-react'
import Poster from '@/components/ui/Poster'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Spinner, ErrorState, EmptyState, Alert } from '@/components/ui/States'
import EventCard from '@/components/event/EventCard'
import Gallery from '@/components/event/Gallery'
import ReviewSection from '@/components/event/ReviewSection'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFavorites } from '@/context/FavoritesContext'
import { useToast } from '@/context/ToastContext'
import { getEventBySlug, getRelatedEvents, recordView, recordTicketClick } from '@/services/eventService'
import { formatDateRange, formatTime, formatPrice, mapsDirectionsUrl, mapsEmbedUrl, youtubeEmbed, regionLabel } from '@/utils/format'

export default function EventDetailPage() {
  const { slug } = useParams()
  const toast = useToast()
  const fav = useFavorites()
  const ev = useAsync(() => getEventBySlug(slug), [slug])
  const e = ev.data
  const related = useAsync(() => (e ? getRelatedEvents(e) : Promise.resolve([])), [e?.id])
  useDocumentTitle(e?.title || 'Detail event')

  useEffect(() => {
    if (e?.id) recordView(e.id)
  }, [e?.id])

  if (ev.loading) return <Spinner />
  if (ev.error) return <div className="container"><ErrorState message={ev.error} onRetry={ev.reload} /></div>
  if (!e)
    return (
      <div className="container">
        <EmptyState icon={AlertTriangle} title="Event tidak ditemukan" description="Event ini mungkin sudah diarsipkan atau tautannya salah." action={<Button to="/explore">Jelajahi event lain</Button>} />
      </div>
    )

  const isFav = fav.isFavorite(e.id)
  const rating = e.statistics?.average_rating || 0
  const reviewsCount = e.statistics?.total_reviews || 0
  const directions = mapsDirectionsUrl(e.latitude, e.longitude, `${e.venue_name} ${e.address}`)
  const videos = e.media.filter((m) => m.file_type === 'video' || m.file_type === 'video_link')
  const ended = e.status === 'completed' || new Date(e.end_date || e.start_date) < new Date()
  const canBuy = e.status === 'published' && !ended && e.ticket_url

  const openTicket = () => {
    recordTicketClick(e.id)
    window.open(e.ticket_url, '_blank', 'noopener,noreferrer')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: e.title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Tautan event disalin.')
      }
    } catch { /* dibatalkan pengguna */ }
  }

  return (
    <>
      <section className="detail-hero">
        <div className="detail-hero__blur" aria-hidden="true"><Poster src={e.poster_url} title="" /></div>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Beranda</Link><ChevronRight aria-hidden="true" />
            <Link to="/explore">Event</Link><ChevronRight aria-hidden="true" />
            {e.category && <Link to={`/explore?category=${e.category.slug}`}>{e.category.name}</Link>}
          </nav>
          <div className="detail-hero__grid">
            <div className="detail-poster"><Poster src={e.poster_url} title={e.title} meta={e.region?.city} eager /></div>
            <div>
              <div className="row">
                {e.category && <Badge tone="plum">{e.category.name}</Badge>}
                {e.region && <Link to={`/explore?region=${e.region.slug}`}><Badge tone="amber"><MapPin /> {e.region.city}</Badge></Link>}
                {e.status !== 'published' && <StatusBadge status={e.status} />}
              </div>
              <h1 className="detail-title">{e.title}</h1>
              <div className="detail-quick">
                <a href="#ulasan" className="rating-pill" aria-label={`Rating ${rating.toFixed(1)} dari ${reviewsCount} ulasan`}>
                  <Star aria-hidden="true" /> {rating ? rating.toFixed(1) : '–'} <span>({reviewsCount} ulasan)</span>
                </a>
                <Button variant="secondary" className={`fav-btn ${isFav ? 'is-active' : ''}`} onClick={() => fav.toggle(e.id)} aria-pressed={isFav}>
                  <Heart /> {isFav ? 'Tersimpan' : 'Simpan'}
                </Button>
                <Button variant="ghost" icon onClick={share} aria-label="Bagikan event"><Share2 /></Button>
              </div>
              {e.status === 'cancelled' && <div style={{ marginTop: 16 }}><Alert>Event ini dibatalkan oleh penyelenggara.{e.cancel_reason ? ` Alasan: ${e.cancel_reason}` : ''}</Alert></div>}
              <div className="facts">
                <div className="fact"><span className="fact__icon"><CalendarDays /></span><div><small>Tanggal</small><strong>{formatDateRange(e.start_date, e.end_date)}</strong></div></div>
                <div className="fact"><span className="fact__icon"><Clock /></span><div><small>Waktu</small><strong>{formatTime(e.start_date)} – {formatTime(e.end_date)} WIB</strong></div></div>
                <div className="fact"><span className="fact__icon"><MapPin /></span><div><small>Lokasi</small><strong>{e.venue_name}</strong><br /><a className="link" href="#lokasi">Lihat peta</a></div></div>
                <div className="fact"><span className="fact__icon"><Ticket /></span><div><small>Harga</small><strong>{formatPrice(e.ticket_price_min, e.ticket_price_max)}</strong></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container detail-body">
        <div>
          <section className="detail-section" id="deskripsi">
            <h2>Tentang event</h2>
            <p className="prose">{e.description}</p>
          </section>

          {e.performers.length > 0 && (
            <section className="detail-section" id="pengisi">
              <h2>Pengisi acara</h2>
              <div className="performers">
                {e.performers.map((p) => (
                  <div key={p.id} className="performer">
                    <Avatar src={p.photo_url} name={p.name} />
                    <strong>{p.name}</strong>
                    <span>{p.role}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {e.schedules.length > 0 && (
            <section className="detail-section" id="rundown">
              <h2>Rundown acara</h2>
              <ol className="timeline">
                {e.schedules.map((s) => (
                  <li key={s.id}>
                    <time dateTime={s.start_time}>{formatTime(s.start_time)}<small>– {formatTime(s.end_time)}</small></time>
                    <div>
                      <strong>{s.title}</strong>
                      {s.description && <p>{s.description}</p>}
                      <div className="meta">
                        {s.speaker && <span><Mic2 aria-hidden="true" /> {s.speaker}</span>}
                        {s.location && <span><MapPin aria-hidden="true" /> {s.location}</span>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(videos.length > 0 || e.media.some((m) => m.file_type === 'image')) && (
            <section className="detail-section" id="galeri">
              <h2>Galeri &amp; video</h2>
              <div className="stack">
                {videos.map((v) => {
                  const yt = v.file_type === 'video_link' ? youtubeEmbed(v.file_url) : null
                  return (
                    <div key={v.id} className="video-frame">
                      {yt ? <iframe src={yt} title={v.caption || 'Video preview'} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /> : <video src={v.file_url} controls preload="metadata" />}
                    </div>
                  )
                })}
                <Gallery items={e.media} />
              </div>
            </section>
          )}

          <section className="detail-section" id="lokasi">
            <h2>Lokasi</h2>
            <div className="stack">
              <div className="map-frame">
                <iframe title={`Peta ${e.venue_name}`} src={mapsEmbedUrl(e.latitude, e.longitude, `${e.venue_name} ${e.address}`, import.meta.env.VITE_GOOGLE_MAPS_API_KEY)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div className="row-between">
                <div>
                  <strong>{e.venue_name}</strong>
                  <p className="text-sm text-muted">{e.address} · {regionLabel(e.region)}</p>
                </div>
                <Button href={directions} variant="secondary"><Navigation /> Petunjuk arah</Button>
              </div>
            </div>
          </section>

          <section className="detail-section" id="ulasan">
            <h2>Rating &amp; ulasan</h2>
            <ReviewSection event={e} onChanged={ev.reload} />
          </section>
        </div>

        <aside>
          <div className="ticket-card">
            <div className="ticket-card__price">
              <small>Harga tiket</small>
              <b>{formatPrice(e.ticket_price_min, e.ticket_price_max)}</b>
            </div>
            {canBuy ? (
              <Button variant="accent" size="lg" block onClick={openTicket}><Ticket /> Beli tiket / Daftar <ExternalLink /></Button>
            ) : (
              <Button size="lg" block disabled>{e.status === 'cancelled' ? 'Event dibatalkan' : 'Event telah berakhir'}</Button>
            )}
            <Button href={directions} variant="secondary" block><Navigation /> Petunjuk arah</Button>
            <p className="ticket-card__note"><Info aria-hidden="true" /> Pembelian tiket diproses di platform resmi penyelenggara. Festify tidak menyimpan data pembayaranmu.</p>
            {e.organizer && (
              <Link to={`/organizers/${e.organizer.id}`} className="org-card">
                <Avatar src={e.organizer.avatar_url} name={e.organizer.full_name} />
                <div className="grow">
                  <span className="text-xs text-muted">Diselenggarakan oleh</span>
                  <strong className="text-sm" style={{ display: 'block' }}>{e.organizer.full_name}</strong>
                </div>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
        </aside>
      </div>

      {related.data?.length > 0 && (
        <section className="section container">
          <div className="section__head"><h2 className="section__title">Event serupa</h2></div>
          <div className="event-grid">{related.data.map((r) => <EventCard key={r.id} event={r} />)}</div>
        </section>
      )}

      {canBuy && <div className="mobile-cta-spacer" aria-hidden="true" />}
      {canBuy && (
        <div className="mobile-cta">
          <div className="grow"><span className="text-xs text-muted">Mulai</span><br /><b>{formatPrice(e.ticket_price_min, null)}</b></div>
          <Button variant="accent" onClick={openTicket}><Ticket /> Beli tiket</Button>
        </div>
      )}
    </>
  )
}
