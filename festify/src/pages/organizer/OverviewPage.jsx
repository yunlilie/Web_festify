import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, MessageSquareText, MousePointerClick, CalendarDays, Plus, Star, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import StatCard from '@/components/ui/StatCard'
import LineChart from '@/components/ui/LineChart'
import Poster from '@/components/ui/Poster'
import { StatusBadge } from '@/components/ui/Badge'
import { Stars } from '@/components/ui/StarRating'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getOrganizerOverview } from '@/services/statsService'
import { listOrganizerReviews } from '@/services/reviewService'
import { formatCompact, formatNumber, formatPercent, formatShortDate, timeAgo } from '@/utils/format'

export const CHART_SERIES = [
  { key: 'views', label: 'Views', color: '#6a0dad' },
  { key: 'ticket_clicks', label: 'Klik tiket', color: '#f43f5e' },
]

export default function OverviewPage() {
  useDocumentTitle('Dashboard organizer')
  const { user, profile } = useAuth()
  const [days, setDays] = useState(30)
  const ov = useAsync(() => getOrganizerOverview(user.id, { days }), [user.id, days])
  const reviews = useAsync(() => listOrganizerReviews(user.id), [user.id])

  if (ov.loading && !ov.data) return <Spinner />
  if (ov.error) return <ErrorState message={ov.error} onRetry={ov.reload} />
  const { totals, series, perEvent } = ov.data

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Halo, {profile.full_name.split(' ')[0]}</h1>
          <p>Ringkasan performa semua event milikmu.</p>
        </div>
        <Button to="/organizer/events/new"><Plus /> Tambah event</Button>
      </div>

      {!totals.events ? (
        <div className="card"><EmptyState icon={CalendarDays} title="Belum ada event" description="Buat event pertamamu. Simpan sebagai draft dulu, lalu terbitkan setelah semua data lengkap." action={<Button to="/organizer/events/new"><Plus /> Buat event</Button>} /></div>
      ) : (
        <div className="stack-lg">
          <section className="card">
            <div className="card__head">
              <div>
                <h2 className="card__title">Performa event</h2>
                <p className="text-xs text-muted">Views dan klik tombol tiket per hari</p>
              </div>
              <div className="row" role="group" aria-label="Rentang waktu">
                {[7, 14, 30].map((d) => (
                  <button key={d} type="button" className="chip" aria-pressed={days === d} onClick={() => setDays(d)}>{d} hari</button>
                ))}
              </div>
            </div>
            <LineChart data={series} series={CHART_SERIES} />
          </section>

          <div className="stat-grid">
            <StatCard icon={CalendarDays} label="Total event" value={formatNumber(totals.events)} hint={`${totals.published} published`} />
            <StatCard icon={Eye} label="Total views" value={formatCompact(totals.views)} />
            <StatCard icon={Heart} label="Favorit" value={formatCompact(totals.favorites)} />
            <StatCard icon={MessageSquareText} label="Ulasan" value={formatNumber(totals.reviews)} hint={totals.average_rating ? `Rata-rata ${totals.average_rating.toFixed(1)} ★` : 'Belum ada rating'} />
            <StatCard icon={MousePointerClick} label="CTR tiket" value={formatPercent(totals.ctr)} hint={`${formatNumber(totals.ticket_clicks)} klik`} />
          </div>

          <div className="dash-grid dash-grid--main">
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Event terbaru</h2>
                <Link to="/organizer/events" className="section__more">Kelola <ArrowRight /></Link>
              </div>
              {[...perEvent].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5).map((e) => (
                <div key={e.id} className="list-row">
                  <div className="table__thumb"><Poster src={e.poster_url} title={e.title} /></div>
                  <div className="grow">
                    <strong>{e.title}</strong>
                    <span>{formatShortDate(e.start_date)} · {formatCompact(e.total_views)} views · CTR {formatPercent(e.ctr)}</span>
                  </div>
                  <StatusBadge status={e.status} archived={e.archived_at} />
                  <Button variant="ghost" size="sm" to={`/organizer/events/${e.id}/edit`}>Edit</Button>
                </div>
              ))}
            </section>
            <section className="card">
              <div className="card__head">
                <h2 className="card__title">Ulasan terbaru</h2>
                <Link to="/organizer/reviews" className="section__more">Semua <ArrowRight /></Link>
              </div>
              {reviews.loading ? <Spinner /> : !reviews.data?.length ? (
                <EmptyState compact icon={Star} title="Belum ada ulasan" />
              ) : (
                reviews.data.slice(0, 4).map((r) => (
                  <div key={r.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                    <div className="grow">
                      <div className="row-between"><strong>{r.user?.full_name}</strong><Stars value={r.rating} size={13} /></div>
                      <span style={{ display: 'block' }}>{r.event?.title} · {timeAgo(r.created_at)}</span>
                      <p className="text-sm" style={{ marginTop: 4 }}>{r.comment}</p>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      )}
    </>
  )
}
