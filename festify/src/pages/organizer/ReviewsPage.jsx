import { useState } from 'react'
import { MessageSquareText, Reply, Pencil, Trash2, BadgeCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Select, Textarea } from '@/components/ui/Field'
import { Stars } from '@/components/ui/StarRating'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listOrganizerReviews, replyToReview, deleteReply } from '@/services/reviewService'
import { listMyEvents } from '@/services/eventService'
import { formatDate, formatTime } from '@/utils/format'
import { friendlyError } from '@/utils/errors'

function ReplyBox({ review, onDone }) {
  const { user } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(review.reply?.reply || '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setErr('')
    try {
      await replyToReview(user.id, review.id, text)
      toast.success('Balasan dikirim. Pengulas akan menerima notifikasi.')
      setOpen(false)
      onDone()
    } catch (e) {
      setErr(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    await deleteReply(user.id, review.id)
    toast.success('Balasan dihapus.')
    setText('')
    onDone()
  }

  if (!open)
    return review.reply ? (
      <div className="review__reply">
        <strong><BadgeCheck /> Balasanmu</strong>
        {review.reply.reply}
        <div className="row" style={{ marginTop: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}><Pencil /> Ubah</Button>
          <Button variant="ghost" size="sm" onClick={remove}><Trash2 /> Hapus</Button>
        </div>
      </div>
    ) : (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} style={{ marginTop: 12 }}><Reply /> Balas ulasan</Button>
    )

  return (
    <div className="stack-sm" style={{ marginTop: 12 }}>
      <Textarea label="Balasan" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} error={err} placeholder="Terima kasih atas ulasannya…" />
      <div className="row">
        <Button size="sm" onClick={submit} loading={busy} disabled={!text.trim()}>Kirim balasan</Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  useDocumentTitle('Ulasan event')
  const { user } = useAuth()
  const [eventId, setEventId] = useState('')
  const [rating, setRating] = useState('')
  const events = useAsync(() => listMyEvents(user.id), [user.id])
  const list = useAsync(() => listOrganizerReviews(user.id, { eventId, rating }), [user.id, eventId, rating])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ulasan event</h1>
          <p>Pantau rating dan balas ulasan pengunjung. Ulasan yang melanggar akan dimoderasi oleh admin.</p>
        </div>
      </div>
      <div className="card stack">
        <div className="form-grid form-grid--2" style={{ maxWidth: 620 }}>
          <Select label="Event" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">Semua event</option>
            {(events.data || []).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </Select>
          <Select label="Rating" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Semua rating</option>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} bintang</option>)}
          </Select>
        </div>
        {list.loading ? <Spinner /> : list.error ? <ErrorState message={list.error} onRetry={list.reload} compact /> : !list.data.length ? (
          <EmptyState compact icon={MessageSquareText} title="Belum ada ulasan" description="Ulasan pengunjung untuk event-mu akan tampil di sini." />
        ) : (
          list.data.map((r) => (
            <article key={r.id} className="review">
              <div className="review__head">
                <Avatar src={r.user?.avatar_url} name={r.user?.full_name} size="sm" />
                <div className="grow">
                  <strong>{r.user?.full_name}</strong>
                  <time dateTime={r.created_at}>{formatDate(r.created_at)}, {formatTime(r.created_at)} · {r.event?.title}</time>
                </div>
                <Stars value={r.rating} size={15} />
              </div>
              <p className="review__body">{r.comment}</p>
              <ReplyBox review={r} onDone={list.reload} />
            </article>
          ))
        )}
      </div>
    </>
  )
}
