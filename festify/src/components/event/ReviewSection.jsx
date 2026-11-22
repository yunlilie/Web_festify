import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MessageSquareText, BadgeCheck, LogIn } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { Textarea } from '../ui/Field'
import { Stars, StarInput } from '../ui/StarRating'
import { EmptyState, ErrorState, LinesSkeleton, Alert } from '../ui/States'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { listEventReviews, submitReview, getMyReview } from '@/services/reviewService'
import { formatDate, timeAgo } from '@/utils/format'
import { friendlyError } from '@/utils/errors'

export default function ReviewSection({ event, onChanged }) {
  const { user } = useAuth()
  const location = useLocation()
  const toast = useToast()
  const reviews = useAsync(() => listEventReviews(event.id), [event.id])
  const [form, setForm] = useState({ rating: 0, comment: '' })
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [mine, setMine] = useState(null)

  useEffect(() => {
    if (!user) { setMine(null); return }
    getMyReview(user.id, event.id).then((r) => {
      setMine(r)
      if (r) setForm({ rating: r.rating, comment: r.comment })
    })
  }, [user, event.id])

  const list = reviews.data || []
  const total = list.length
  const avg = total ? list.reduce((a, r) => a + r.rating, 0) / total : 0
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: list.filter((r) => r.rating === s).length }))

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.rating) return setErr('Pilih rating 1 sampai 5 bintang.')
    if (form.comment.trim().length < 10) return setErr('Ulasan minimal 10 karakter.')
    setSaving(true)
    try {
      const saved = await submitReview(user.id, event.id, form)
      setMine(saved)
      setEditing(false)
      toast.success(mine ? 'Ulasan diperbarui.' : 'Terima kasih! Ulasanmu sudah tayang.')
      reviews.reload()
      onChanged?.()
    } catch (e2) {
      setErr(friendlyError(e2))
    } finally {
      setSaving(false)
    }
  }

  const showForm = user && (!mine || editing)
  const canReview = event.status !== 'cancelled'

  return (
    <div>
      {total > 0 && (
        <div className="review-summary">
          <div className="review-summary__score">
            <b>{avg.toFixed(1)}</b>
            <Stars value={avg} />
            <p className="text-xs text-muted" style={{ marginTop: 6 }}>{total} ulasan</p>
          </div>
          <div className="bars" aria-label="Distribusi rating">
            {dist.map(({ s, n }) => (
              <div key={s}>
                <span>{s}★</span>
                <i><span style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></i>
                <span className="text-muted">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {canReview && !user && (
        <div className="review-form" style={{ alignItems: 'flex-start' }}>
          <strong>Pernah atau akan datang ke event ini?</strong>
          <p className="text-sm text-muted">Masuk untuk memberi rating dan berbagi pengalamanmu.</p>
          <Button to="/login" state={{ from: location.pathname }} variant="secondary"><LogIn /> Masuk untuk menulis ulasan</Button>
        </div>
      )}

      {canReview && user && mine && !editing && (
        <Alert tone="info" icon={BadgeCheck}>
          Kamu sudah memberi ulasan untuk event ini.{' '}
          <button type="button" className="link" style={{ border: 0, background: 'none', padding: 0 }} onClick={() => setEditing(true)}>Ubah ulasan</button>
        </Alert>
      )}

      {canReview && showForm && (
        <form className="review-form" onSubmit={submit} noValidate>
          <strong>{mine ? 'Ubah ulasanmu' : 'Tulis ulasan'}</strong>
          <StarInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} disabled={saving} />
          <Textarea
            label="Komentar"
            required
            maxLength={1000}
            placeholder="Ceritakan pengalamanmu. Gunakan bahasa yang sopan ya."
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            hint={`${form.comment.length}/1000 · Ulasan dengan kata kasar, SARA, atau spam akan ditolak.`}
          />
          {err && <Alert>{err}</Alert>}
          <div className="row">
            <Button type="submit" loading={saving}>{mine ? 'Simpan perubahan' : 'Kirim ulasan'}</Button>
            {editing && <Button variant="ghost" onClick={() => setEditing(false)}>Batal</Button>}
          </div>
        </form>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        {reviews.loading ? (
          <LinesSkeleton />
        ) : reviews.error ? (
          <ErrorState compact message={reviews.error} onRetry={reviews.reload} />
        ) : !total ? (
          <EmptyState compact icon={MessageSquareText} title="Belum ada ulasan" description="Jadilah yang pertama membagikan pengalaman tentang event ini." />
        ) : (
          list.map((r) => (
            <article key={r.id} className="review">
              <div className="review__head">
                <Avatar src={r.user?.avatar_url} name={r.user?.full_name} size="sm" />
                <div className="grow">
                  <strong>{r.user?.full_name}</strong>
                  <time dateTime={r.created_at} title={formatDate(r.created_at)}>{timeAgo(r.created_at)}</time>
                </div>
                <Stars value={r.rating} size={15} />
              </div>
              <p className="review__body">{r.comment}</p>
              {r.reply && (
                <div className="review__reply">
                  <strong><BadgeCheck aria-hidden="true" /> Balasan {event.organizer?.full_name}</strong>
                  {r.reply.reply}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}
