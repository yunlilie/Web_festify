import { useState } from 'react'
import { Eye, Heart, MessageSquareText, MousePointerClick, Star, Percent } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import LineChart from '@/components/ui/LineChart'
import { Select } from '@/components/ui/Field'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getOrganizerOverview } from '@/services/statsService'
import { listMyEvents } from '@/services/eventService'
import { formatNumber, formatPercent } from '@/utils/format'

const SERIES = [
  { key: 'views', label: 'Views', color: '#6a0dad' },
  { key: 'ticket_clicks', label: 'Klik tiket', color: '#f43f5e' },
  { key: 'favorites', label: 'Favorit', color: '#f28c1c' },
]

export default function AnalyticsPage() {
  useDocumentTitle('Statistik event')
  const { user } = useAuth()
  const [eventId, setEventId] = useState('')
  const [days, setDays] = useState(30)
  const events = useAsync(() => listMyEvents(user.id), [user.id])
  const ov = useAsync(() => getOrganizerOverview(user.id, { days, eventId }), [user.id, days, eventId])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Statistik event</h1>
          <p>CTR = klik tombol tiket ÷ views. Views dihitung maksimal sekali per pengunjung per hari.</p>
        </div>
        <div className="row">
          <Select aria-label="Pilih event" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Semua event</option>
            {(events.data || []).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </Select>
          <Select aria-label="Rentang" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 hari</option>
            <option value={14}>14 hari</option>
            <option value={30}>30 hari</option>
          </Select>
        </div>
      </div>
      {ov.loading && !ov.data ? <Spinner /> : ov.error ? <ErrorState message={ov.error} onRetry={ov.reload} /> : !ov.data.totals.events ? (
        <div className="card"><EmptyState title="Belum ada data" description="Statistik muncul setelah event diterbitkan." /></div>
      ) : (
        <div className="stack-lg">
          <section className="card">
            <div className="card__head"><h2 className="card__title">Perkembangan performa</h2></div>
            <LineChart data={ov.data.series} series={SERIES} height={260} />
          </section>
          <div className="stat-grid">
            <StatCard icon={Eye} label="Total views" value={formatNumber(ov.data.totals.views)} />
            <StatCard icon={Heart} label="Total favorit" value={formatNumber(ov.data.totals.favorites)} />
            <StatCard icon={MessageSquareText} label="Total ulasan" value={formatNumber(ov.data.totals.reviews)} />
            <StatCard icon={Star} label="Rata-rata rating" value={ov.data.totals.average_rating ? ov.data.totals.average_rating.toFixed(1) : '–'} />
            <StatCard icon={MousePointerClick} label="Klik tiket" value={formatNumber(ov.data.totals.ticket_clicks)} />
            <StatCard icon={Percent} label="CTR" value={formatPercent(ov.data.totals.ctr)} />
          </div>
          <section className="card card--flush">
            <div style={{ padding: 'var(--sp-5)' }}><h2 className="card__title">Per event</h2></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Event</th><th>Views</th><th>Favorit</th><th>Ulasan</th><th>Rating</th><th>Klik tiket</th><th>CTR</th></tr></thead>
                <tbody>
                  {ov.data.perEvent.map((e) => (
                    <tr key={e.id}>
                      <td><strong>{e.title}</strong></td>
                      <td>{formatNumber(e.total_views)}</td>
                      <td>{formatNumber(e.total_favorites)}</td>
                      <td>{formatNumber(e.total_reviews)}</td>
                      <td>{e.total_reviews ? e.average_rating.toFixed(1) : '–'}</td>
                      <td>{formatNumber(e.total_ticket_clicks)}</td>
                      <td>{formatPercent(e.ctr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
