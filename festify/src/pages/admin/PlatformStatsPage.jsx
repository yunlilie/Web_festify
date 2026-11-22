import { useState } from 'react'
import { Users, CalendarDays, MessageSquareText, Heart, Eye, MousePointerClick } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import LineChart from '@/components/ui/LineChart'
import { Spinner, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getPlatformStats } from '@/services/statsService'
import { Bars } from './AdminDashboardPage'
import { formatNumber, formatPercent, formatCompact } from '@/utils/format'

export default function PlatformStatsPage() {
  useDocumentTitle('Statistik platform')
  const [days, setDays] = useState(30)
  const s = useAsync(() => getPlatformStats({ days }), [days])
  if (s.loading && !s.data) return <Spinner />
  if (s.error) return <ErrorState message={s.error} onRetry={s.reload} />
  const d = s.data
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Statistik platform</h1>
          <p>Agregat seluruh event dan pengguna Festify.</p>
        </div>
        <div className="row">
          {[7, 14, 30].map((n) => <button key={n} type="button" className="chip" aria-pressed={days === n} onClick={() => setDays(n)}>{n} hari</button>)}
        </div>
      </div>
      <div className="stack-lg">
        <div className="stat-grid">
          <StatCard icon={Users} label="Pengguna" value={formatNumber(d.users)} />
          <StatCard icon={CalendarDays} label="Event" value={formatNumber(d.events)} />
          <StatCard icon={MessageSquareText} label="Ulasan" value={formatNumber(d.reviews)} />
          <StatCard icon={Heart} label="Favorit" value={formatNumber(d.favorites)} />
          <StatCard icon={Eye} label="Views" value={formatCompact(d.views)} />
          <StatCard icon={MousePointerClick} label="CTR" value={formatPercent(d.ctr)} hint={`${formatNumber(d.clicks)} klik tiket`} />
        </div>
        <section className="card">
          <div className="card__head"><h2 className="card__title">Views, klik tiket, favorit</h2></div>
          <LineChart data={d.series} series={[{ key: 'views', label: 'Views', color: '#6a0dad' }, { key: 'ticket_clicks', label: 'Klik tiket', color: '#f43f5e' }, { key: 'favorites', label: 'Favorit', color: '#f28c1c' }]} height={260} />
        </section>
        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <section className="card">
            <h2 className="card__title" style={{ marginBottom: 16 }}>Event per kategori</h2>
            <Bars rows={d.byCategory} labelKey="name" valueKey="total" />
          </section>
          <section className="card">
            <h2 className="card__title" style={{ marginBottom: 16 }}>Top 5 event (views)</h2>
            {d.topEvents.map((e, i) => (
              <div key={e.id} className="list-row">
                <strong style={{ width: 20 }}>{i + 1}</strong>
                <div className="grow"><strong>{e.title}</strong><span>{e.organizer?.full_name}</span></div>
                <span className="text-sm">{formatCompact(e.statistics.total_views)}</span>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
