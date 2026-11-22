import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, CalendarClock, MessageSquareReply, Megaphone, Star, CheckCheck, XCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, LinesSkeleton } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listNotifications, markRead, markAllRead } from '@/services/notificationService'
import { NOTIF_TYPES } from '@/utils/constants'
import { timeAgo } from '@/utils/format'
import { db } from '@/services/preview/db'

const ICONS = { event_updated: CalendarClock, event_cancelled: XCircle, review_reply: MessageSquareReply, review_new: Star, announcement: Megaphone, system: Bell }

export default function NotificationsPage() {
  useDocumentTitle('Notifikasi')
  const { user, role } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const list = useAsync(() => listNotifications(user.id), [user.id])
  const [tab, setTab] = useState('all')
  const items = (list.data || []).filter((n) => (tab === 'unread' ? !n.is_read : true))
  const unread = (list.data || []).filter((n) => !n.is_read).length

  const open = async (n) => {
    if (!n.is_read) {
      await markRead(user.id, n.id)
      list.setData((d) => d.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
    }
    if (!n.reference_id) return
    if (n.notification_type === 'review_new' && role === 'organizer') return navigate('/organizer/reviews')
    // Tahap 4: reference_id → slug via query. Pratinjau: cari di data contoh.
    const ev = db.events.find((e) => e.id === n.reference_id)
    if (ev) navigate(`/events/${ev.slug}`)
  }

  const readAll = async () => {
    await markAllRead(user.id)
    list.setData((d) => d.map((x) => ({ ...x, is_read: true })))
    toast.success('Semua notifikasi ditandai sudah dibaca.')
  }

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <header className="page-title row-between">
        <div>
          <h1>Notifikasi</h1>
          <p>Kabar terbaru tentang event favorit, ulasan, dan pengumuman.</p>
        </div>
        <Button variant="secondary" onClick={readAll} disabled={!unread}><CheckCheck /> Tandai semua dibaca</Button>
      </header>
      <div className="card card--flush">
        <div style={{ padding: '0 var(--sp-4)' }}>
          <Tabs value={tab} onChange={setTab} tabs={[{ value: 'all', label: 'Semua', count: list.data?.length }, { value: 'unread', label: 'Belum dibaca', count: unread }]} />
        </div>
        {list.loading ? (
          <div style={{ padding: 'var(--sp-6)' }}><LinesSkeleton /></div>
        ) : list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} compact />
        ) : !items.length ? (
          <EmptyState compact icon={BellOff} title={tab === 'unread' ? 'Semua sudah dibaca' : 'Belum ada notifikasi'} description="Notifikasi baru akan muncul di sini." />
        ) : (
          <ul className="notif-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {items.map((n) => {
              const Icon = ICONS[n.notification_type] || Bell
              return (
                <li key={n.id} className={`notif ${n.is_read ? '' : 'is-unread'}`}>
                  <span className="notif__icon"><Icon aria-hidden="true" /></span>
                  <button type="button" className="grow" style={{ textAlign: 'left', border: 0, background: 'none', padding: 0 }} onClick={() => open(n)}>
                    <div className="row" style={{ gap: 8 }}>
                      <strong>{n.title}</strong>
                      <Badge>{NOTIF_TYPES[n.notification_type] || 'Info'}</Badge>
                    </div>
                    <p>{n.message}</p>
                    <time dateTime={n.created_at}>{timeAgo(n.created_at)}</time>
                  </button>
                  {!n.is_read ? <Badge tone="coral">Baru</Badge> : <span className="text-xs text-muted">Dibaca</span>}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
