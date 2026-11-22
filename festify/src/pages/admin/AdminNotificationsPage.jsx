import { useState } from 'react'
import { Send, Megaphone } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Field'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Spinner, EmptyState, Alert } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { broadcast, listAnnouncements } from '@/services/notificationService'
import { formatDate, formatTime } from '@/utils/format'
import { friendlyError } from '@/utils/errors'

const AUDIENCE = { all: 'Semua pengguna', user: 'Hanya User', organizer: 'Hanya Organizer' }

export default function AdminNotificationsPage() {
  useDocumentTitle('Pengumuman')
  const toast = useToast()
  const history = useAsync(listAnnouncements, [])
  const [v, setV] = useState({ title: '', message: '', audience: 'all' })
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formErr, setFormErr] = useState('')

  const check = (e) => {
    e.preventDefault()
    const errs = {}
    if (!v.title.trim()) errs.title = 'Judul wajib diisi.'
    if (v.message.trim().length < 10) errs.message = 'Isi pengumuman minimal 10 karakter.'
    setErrors(errs)
    if (!Object.keys(errs).length) setConfirm(true)
  }

  const send = async () => {
    setBusy(true)
    setFormErr('')
    try {
      const n = await broadcast(v)
      toast.success(`Pengumuman terkirim ke ${n} pengguna.`)
      setV({ title: '', message: '', audience: 'all' })
      setConfirm(false)
      history.reload()
    } catch (e) {
      setFormErr(friendlyError(e))
      setConfirm(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pengumuman</h1>
          <p>Kirim notifikasi ke pengguna. Notifikasi otomatis (ulasan baru, perubahan jadwal) dibuat oleh sistem.</p>
        </div>
      </div>
      <div className="dash-grid dash-grid--main">
        <form className="card stack" onSubmit={check} noValidate>
          <h2 className="card__title">Pengumuman baru</h2>
          {formErr && <Alert>{formErr}</Alert>}
          <Input label="Judul" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} error={errors.title} maxLength={100} />
          <Textarea label="Isi pengumuman" required rows={5} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} error={errors.message} maxLength={500} hint={`${v.message.length}/500`} />
          <Select label="Penerima" value={v.audience} onChange={(e) => setV({ ...v, audience: e.target.value })}>
            {Object.entries(AUDIENCE).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
          <div><Button type="submit"><Send /> Kirim pengumuman</Button></div>
        </form>
        <section className="card">
          <h2 className="card__title" style={{ marginBottom: 'var(--sp-4)' }}>Riwayat</h2>
          {history.loading ? <Spinner /> : !history.data?.length ? (
            <EmptyState compact icon={Megaphone} title="Belum ada pengumuman" />
          ) : (
            history.data.map((a) => (
              <div key={a.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                <div className="grow">
                  <strong>{a.title}</strong>
                  <span style={{ display: 'block' }}>{formatDate(a.created_at)} {formatTime(a.created_at)} · {a.recipients} penerima</span>
                  <p className="text-sm" style={{ marginTop: 4 }}>{a.message}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={send} loading={busy} tone="primary" title="Kirim pengumuman?" message={`Pengumuman “${v.title}” akan dikirim ke: ${AUDIENCE[v.audience]}. Notifikasi yang terkirim tidak bisa ditarik.`} confirmLabel="Kirim" />
    </>
  )
}
