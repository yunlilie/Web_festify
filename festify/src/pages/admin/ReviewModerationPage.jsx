import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, EyeOff, Eye, Trash2, ShieldCheck } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Stars } from '@/components/ui/StarRating'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listAllReviews, setReviewStatus, adminDeleteReview, findBlockedWord } from '@/services/reviewService'
import { timeAgo } from '@/utils/format'
import { friendlyError } from '@/utils/errors'

export default function ReviewModerationPage() {
  useDocumentTitle('Moderasi ulasan')
  const toast = useToast()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const dq = useDebounce(q)
  const list = useAsync(() => listAllReviews({ status, q: dq }), [status, dq])
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const toggle = async (r) => {
    try {
      await setReviewStatus(r.id, r.status === 'visible' ? 'hidden' : 'visible')
      toast.success(r.status === 'visible' ? 'Ulasan disembunyikan dari publik.' : 'Ulasan ditampilkan kembali.')
      list.reload()
    } catch (e) {
      toast.error(friendlyError(e))
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await adminDeleteReview(del.id)
      toast.success('Ulasan dihapus permanen.')
      setDel(null)
      list.reload()
    } catch (e) {
      toast.error(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Moderasi ulasan</h1>
          <p>Sembunyikan atau hapus ulasan yang melanggar aturan (REQ-4.7.5, REQ-BR-0.3).</p>
        </div>
        <Button variant="secondary" to="/admin/blocked-words">Kelola kata terlarang</Button>
      </div>
      <div className="card card--flush">
        <div className="stack" style={{ padding: 'var(--sp-4) var(--sp-5) 0' }}>
          <div className="input-icon" style={{ maxWidth: 360 }}>
            <Search aria-hidden="true" />
            <input className="input" type="search" placeholder="Cari isi ulasan, pengguna, atau event" aria-label="Cari ulasan" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Tabs value={status} onChange={setStatus} tabs={[{ value: '', label: 'Semua' }, { value: 'visible', label: 'Tampil' }, { value: 'hidden', label: 'Disembunyikan' }]} />
        </div>
        <div style={{ padding: '0 var(--sp-5)' }}>
          {list.loading ? <Spinner /> : list.error ? <ErrorState compact message={list.error} onRetry={list.reload} /> : !list.data.length ? (
            <EmptyState compact icon={ShieldCheck} title="Tidak ada ulasan" description="Tidak ada ulasan di kategori ini." />
          ) : (
            list.data.map((r) => {
              const flagged = findBlockedWord(r.comment)
              return (
                <article key={r.id} className="review">
                  <div className="review__head">
                    <Avatar src={r.user?.avatar_url} name={r.user?.full_name} size="sm" />
                    <div className="grow">
                      <strong>{r.user?.full_name}</strong>
                      <time>{timeAgo(r.created_at)} · <Link className="link" to={`/events/${r.event?.slug}`}>{r.event?.title}</Link></time>
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p className="review__body">{r.comment}</p>
                  <div className="row" style={{ marginTop: 10 }}>
                    {r.status === 'hidden' ? <Badge tone="warning">Disembunyikan</Badge> : <Badge tone="success">Tampil</Badge>}
                    {flagged && <Badge tone="danger">Mengandung “{flagged}”</Badge>}
                    <span className="grow" />
                    <Button variant="ghost" size="sm" onClick={() => toggle(r)}>{r.status === 'visible' ? <><EyeOff /> Sembunyikan</> : <><Eye /> Tampilkan</>}</Button>
                    <Button variant="ghost" size="sm" onClick={() => setDel(r)}><Trash2 /> Hapus</Button>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} onConfirm={remove} loading={busy} title="Hapus ulasan permanen?" message="Ulasan dan balasannya akan dihapus. Rating rata-rata event akan dihitung ulang. Gunakan “Sembunyikan” bila ingin menyimpan jejaknya." confirmLabel="Hapus permanen" />
    </>
  )
}
