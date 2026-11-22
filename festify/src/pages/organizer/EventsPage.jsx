import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Eye, Archive, ArchiveRestore, Ban, Trash2, Send, CalendarDays } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import Poster from '@/components/ui/Poster'
import { StatusBadge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listMyEvents, setEventStatus, archiveEvent, deleteEvent } from '@/services/eventService'
import { formatShortDate, formatCompact } from '@/utils/format'
import { friendlyError } from '@/utils/errors'

const TABS = [
  { value: '', label: 'Aktif' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'archived', label: 'Arsip' },
]

/** Tabel event — dipakai organizer (ownerId = user.id) dan admin (ownerId = null, asAdmin). */
export function EventsTable({ ownerId, asAdmin }) {
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const dq = useDebounce(q, 300)
  const list = useAsync(() => listMyEvents(ownerId, { status, q: dq }), [ownerId, status, dq])
  const [dialog, setDialog] = useState(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    const { type, event } = dialog
    setBusy(true)
    try {
      if (type === 'archive') await archiveEvent(event.id, ownerId, true)
      if (type === 'unarchive') await archiveEvent(event.id, ownerId, false)
      if (type === 'cancel') await setEventStatus(event.id, ownerId, 'cancelled', reason)
      if (type === 'publish') await setEventStatus(event.id, ownerId, 'published')
      if (type === 'delete') await deleteEvent(event.id, { asAdmin, organizerId: ownerId })
      toast.success({ archive: 'Event diarsipkan.', unarchive: 'Event dikembalikan dari arsip.', cancel: 'Event dibatalkan. Pengguna yang memfavoritkan akan diberi notifikasi.', publish: 'Event diterbitkan.', delete: 'Event dihapus permanen.' }[type])
      setDialog(null)
      setReason('')
      list.reload()
    } catch (e) {
      toast.error(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  const DIALOG = {
    archive: { title: 'Arsipkan event?', message: 'Event akan disembunyikan dari katalog dan halaman publik. Ulasan & statistik tetap tersimpan dan bisa dikembalikan kapan saja.', confirmLabel: 'Arsipkan', tone: 'primary' },
    unarchive: { title: 'Kembalikan dari arsip?', message: 'Event akan kembali sesuai statusnya.', confirmLabel: 'Kembalikan', tone: 'primary' },
    cancel: { title: 'Batalkan event?', message: 'Event tetap terlihat dengan label “Dibatalkan” dan tombol tiket dinonaktifkan. Pengguna yang memfavoritkan akan menerima notifikasi.', confirmLabel: 'Batalkan event' },
    publish: { title: 'Terbitkan event?', message: 'Event akan tampil di katalog publik.', confirmLabel: 'Terbitkan', tone: 'primary' },
    delete: { title: 'Hapus permanen?', message: asAdmin ? 'Event beserta seluruh media, rundown, ulasan, dan statistiknya akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.' : 'Hanya draft tanpa ulasan/favorit yang dapat dihapus. Tindakan ini tidak bisa dibatalkan.', confirmLabel: 'Hapus permanen' },
  }

  return (
    <div className="card card--flush">
      <div style={{ padding: 'var(--sp-4) var(--sp-5) 0' }} className="stack">
        <div className="input-icon" style={{ maxWidth: 360 }}>
          <Search aria-hidden="true" />
          <input className="input" type="search" placeholder="Cari judul event" aria-label="Cari event" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Tabs tabs={TABS} value={status} onChange={setStatus} label="Filter status" />
      </div>
      {list.loading ? <Spinner /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} compact /> : !list.data.length ? (
        <EmptyState compact icon={CalendarDays} title="Tidak ada event" description={q ? 'Tidak ada event yang cocok dengan pencarian.' : 'Belum ada event di kategori ini.'} action={!asAdmin && <Button to="/organizer/events/new"><Plus /> Tambah event</Button>} />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                {asAdmin && <th>Organizer</th>}
                <th>Tanggal</th>
                <th>Status</th>
                <th>Views</th>
                <th>Rating</th>
                <th><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {list.data.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="row" style={{ flexWrap: 'nowrap' }}>
                      <div className="table__thumb"><Poster src={e.poster_url} title={e.title} /></div>
                      <div>
                        <strong style={{ display: 'block' }}>{e.title}</strong>
                        <span className="text-xs text-muted">{e.category?.name} · {e.region?.city}</span>
                      </div>
                    </div>
                  </td>
                  {asAdmin && <td className="text-sm">{e.organizer?.full_name}</td>}
                  <td style={{ whiteSpace: 'nowrap' }}>{formatShortDate(e.start_date)}</td>
                  <td><StatusBadge status={e.status} archived={e.archived_at} /></td>
                  <td>{formatCompact(e.statistics.total_views)}</td>
                  <td>{e.statistics.total_reviews ? `${e.statistics.average_rating.toFixed(1)} ★` : '–'}</td>
                  <td>
                    <div className="table__actions">
                      {e.status === 'published' && !e.archived_at && <Button variant="ghost" size="sm" icon to={`/events/${e.slug}`} aria-label="Lihat halaman publik" title="Lihat"><Eye /></Button>}
                      {!asAdmin && <Button variant="ghost" size="sm" icon to={`/organizer/events/${e.id}/edit`} aria-label="Edit" title="Edit"><Pencil /></Button>}
                      {e.status === 'draft' && !e.archived_at && <Button variant="ghost" size="sm" icon onClick={() => setDialog({ type: 'publish', event: e })} aria-label="Terbitkan" title="Terbitkan"><Send /></Button>}
                      {e.status === 'published' && !e.archived_at && <Button variant="ghost" size="sm" icon onClick={() => setDialog({ type: 'cancel', event: e })} aria-label="Batalkan event" title="Batalkan"><Ban /></Button>}
                      {e.archived_at ? (
                        <Button variant="ghost" size="sm" icon onClick={() => setDialog({ type: 'unarchive', event: e })} aria-label="Kembalikan dari arsip" title="Kembalikan"><ArchiveRestore /></Button>
                      ) : (
                        <Button variant="ghost" size="sm" icon onClick={() => setDialog({ type: 'archive', event: e })} aria-label="Arsipkan" title="Arsipkan"><Archive /></Button>
                      )}
                      {(asAdmin || e.status === 'draft') && <Button variant="ghost" size="sm" icon onClick={() => setDialog({ type: 'delete', event: e })} aria-label="Hapus permanen" title="Hapus"><Trash2 /></Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {dialog && (
        <ConfirmDialog open onClose={() => setDialog(null)} onConfirm={run} loading={busy} {...DIALOG[dialog.type]} title={`${DIALOG[dialog.type].title}`}>
          <p className="text-sm" style={{ marginTop: 8 }}><strong>{dialog.event.title}</strong></p>
          {dialog.type === 'cancel' && <div style={{ marginTop: 12 }}><Textarea label="Alasan pembatalan (opsional)" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></div>}
        </ConfirmDialog>
      )}
    </div>
  )
}

export default function EventsPage() {
  useDocumentTitle('Kelola event')
  const { user } = useAuth()
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kelola event</h1>
          <p>Draft, published, selesai, dibatalkan, dan arsip. Event dengan ulasan tidak dihapus — cukup diarsipkan.</p>
        </div>
        <Button to="/organizer/events/new"><Plus /> Tambah event</Button>
      </div>
      <EventsTable ownerId={user.id} />
      <p className="text-xs text-muted" style={{ marginTop: 12 }}>Tips: event yang sudah lewat akan otomatis berstatus <Link className="link" to="/faq">Selesai</Link>.</p>
    </>
  )
}
