import { Link } from 'react-router-dom'
import { Users, CalendarDays, MessageSquareText, Eye, MousePointerClick, ShieldAlert, ArrowRight } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import LineChart from '@/components/ui/LineChart'
import Button from '@/components/ui/Button'
import { Spinner, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getPlatformStats } from '@/services/statsService'
import { formatCompact, formatNumber, formatPercent } from '@/utils/format'
import { EVENT_STATUS, ROLE_LABEL } from '@/utils/constants'

export const Bars = ({ rows, labelKey, valueKey, color = 'var(--primary)' }) => {
  const max = Math.max(1, ...rows.map((r) => r[valueKey]))
  return (
    <div className="bars" style={{ gap: 10 }}>
      {rows.map((r) => (
        <div key={r[labelKey]} style={{ gridTemplateColumns: '110px 1fr 36px' }}>
          <span className="text-sm">{r.label || r[labelKey]}</span>
          <i><span style={{ width: `${(r[valueKey] / max) * 100}%`, background: color }} /></i>
          <span className="text-sm" style={{ textAlign: 'right' }}>{r[valueKey]}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  useDocumentTitle('Dashboard admin')
  const s = useAsync(() => getPlatformStats({ days: 30 }), [])
  if (s.loading) return <Spinner />
  if (s.error) return <ErrorState message={s.error} onRetry={s.reload} />
  const d = s.data
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard admin</h1>
          <p>Kondisi platform Festify dalam 30 hari terakhir.</p>
        </div>
        {d.hiddenReviews > 0 && <Button variant="secondary" to="/admin/reviews"><ShieldAlert /> {d.hiddenReviews} ulasan disembunyikan</Button>}
      </div>
      <div className="stack-lg">
        <div className="stat-grid">
          <StatCard icon={Users} label="Pengguna" value={formatNumber(d.users)} />
          <StatCard icon={CalendarDays} label="Event" value={formatNumber(d.events)} />
          <StatCard icon={MessageSquareText} label="Ulasan" value={formatNumber(d.reviews)} />
          <StatCard icon={Eye} label="Views" value={formatCompact(d.views)} />
          <StatCard icon={MousePointerClick} label="CTR tiket" value={formatPercent(d.ctr)} />
        </div>
        <section className="card">
          <div className="card__head"><h2 className="card__title">Aktivitas platform</h2></div>
          <LineChart data={d.series} series={[{ key: 'views', label: 'Views', color: '#6a0dad' }, { key: 'ticket_clicks', label: 'Klik tiket', color: '#f43f5e' }]} />
        </section>
        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <section className="card">
            <div className="card__head"><h2 className="card__title">Pengguna per role</h2><Link className="section__more" to="/admin/users">Kelola <ArrowRight /></Link></div>
            <Bars rows={d.byRole.map((r) => ({ ...r, label: ROLE_LABEL[r.role] }))} labelKey="role" valueKey="total" />
          </section>
          <section className="card">
            <div className="card__head"><h2 className="card__title">Event per status</h2><Link className="section__more" to="/admin/events">Kelola <ArrowRight /></Link></div>
            <Bars rows={d.byStatus.map((r) => ({ ...r, label: EVENT_STATUS[r.status].label }))} labelKey="status" valueKey="total" color="var(--accent)" />
          </section>
        </div>
      </div>
    </>
  )
}
