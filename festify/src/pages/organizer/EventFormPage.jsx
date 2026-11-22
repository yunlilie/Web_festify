import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useBlocker } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Eye, Save, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { Spinner, ErrorState, EmptyState, Alert } from '@/components/ui/States'
import { ConfirmDialog } from '@/components/ui/Modal'
import StepDetail from './eventForm/StepDetail'
import StepLocation from './eventForm/StepLocation'
import StepMedia from './eventForm/StepMedia'
import StepProgram from './eventForm/StepProgram'
import StepPublish from './eventForm/StepPublish'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getEventForEdit, saveEvent, publishChecklist } from '@/services/eventService'
import { listCategories, listRegions } from '@/services/catalogService'
import { isHttpsUrl } from '@/utils/validators'
import { friendlyError } from '@/utils/errors'

const STEPS = ['Detail', 'Waktu & lokasi', 'Media', 'Rundown & pengisi', 'Tiket & terbit']

const EMPTY = {
  title: '', slug: '', description: '', category_id: null, region_id: null,
  start_date: null, end_date: null, venue_name: '', address: '', latitude: null, longitude: null,
  ticket_price_min: 0, ticket_price_max: '', ticket_url: '', poster_url: null, status: 'draft',
  media: [], schedules: [], performers: [],
}

/** Validasi per langkah. Mengembalikan objek error. */
const validateStep = (step, v) => {
  const e = {}
  if (step === 0) {
    if (!v.title.trim()) e.title = 'Judul wajib diisi.'
    if (!v.slug) e.slug = 'Slug wajib diisi.'
    if (v.description.trim().length < 50) e.description = 'Deskripsi minimal 50 karakter.'
    if (!v.category_id) e.category_id = 'Pilih kategori.'
    if (!v.region_id) e.region_id = 'Pilih wilayah.'
  }
  if (step === 1) {
    if (!v.start_date) e.start_date = 'Tanggal mulai wajib diisi.'
    if (!v.end_date) e.end_date = 'Tanggal selesai wajib diisi.'
    if (v.start_date && v.end_date && new Date(v.end_date) < new Date(v.start_date)) e.end_date = 'Waktu selesai harus setelah waktu mulai.'
    if (!v.venue_name.trim()) e.venue_name = 'Nama venue wajib diisi.'
    if (!v.address.trim()) e.address = 'Alamat wajib diisi.'
    if (v.latitude != null && (v.latitude < -90 || v.latitude > 90)) e.latitude = 'Latitude tidak valid.'
    if (v.longitude != null && (v.longitude < -180 || v.longitude > 180)) e.longitude = 'Longitude tidak valid.'
  }
  if (step === 3) {
    v.performers.forEach((p, i) => { if (!p.name.trim()) e[`performers.${i}.name`] = 'Nama wajib diisi.' })
    v.schedules.forEach((s, i) => {
      if (!s.title.trim()) e[`schedules.${i}.title`] = 'Nama kegiatan wajib diisi.'
      if (!s.start_time) e[`schedules.${i}.start_time`] = 'Wajib diisi.'
      if (!s.end_time) e[`schedules.${i}.end_time`] = 'Wajib diisi.'
      else if (s.start_time && new Date(s.end_time) < new Date(s.start_time)) e[`schedules.${i}.end_time`] = 'Harus setelah waktu mulai.'
    })
  }
  if (step === 4) {
    if (v.ticket_price_min === '' || Number(v.ticket_price_min) < 0) e.ticket_price_min = 'Harga minimum tidak valid.'
    if (v.ticket_price_max !== '' && v.ticket_price_max != null && Number(v.ticket_price_max) < Number(v.ticket_price_min)) e.ticket_price_max = 'Harga maksimum harus ≥ harga minimum.'
    if (v.ticket_url && !isHttpsUrl(v.ticket_url)) e.ticket_url = 'Gunakan URL lengkap yang diawali https://'
  }
  return e
}

export default function EventFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  useDocumentTitle(isEdit ? 'Edit event' : 'Tambah event')
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const cats = useAsync(listCategories, [])
  const regions = useAsync(listRegions, [])
  const existing = useAsync(() => (isEdit ? getEventForEdit(id, user.id) : Promise.resolve(null)), [id])

  const [v, setV] = useState(EMPTY)
  const [step, setStep] = useState(0)
  const [visited, setVisited] = useState(new Set([0]))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState('')
  const [formError, setFormError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [slugTouched, setSlugTouched] = useState(isEdit)

  useEffect(() => {
    if (existing.data) {
      setV({ ...EMPTY, ...existing.data, ticket_price_max: existing.data.ticket_price_max ?? '' })
      setVisited(new Set([0, 1, 2, 3, 4]))
    }
  }, [existing.data])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname)

  const patch = useCallback((p) => {
    setV((x) => ({ ...x, ...p }))
    setDirty(true)
  }, [])
  const set = (k) => (e) => patch({ [k]: e.target.value })

  const goto = (n) => {
    if (n > step) {
      const errs = validateStep(step, v)
      setErrors(errs)
      if (Object.keys(errs).length) return toast.error('Periksa kembali isian yang ditandai.')
    }
    setErrors({})
    setStep(n)
    setVisited((s) => new Set(s).add(n))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async (status) => {
    setFormError('')
    const allErrs = [0, 1, 3, 4].reduce((acc, s) => ({ ...acc, ...validateStep(s, v) }), {})
    // Draft boleh belum lengkap, tapi field yang diisi harus valid.
    // Untuk draft: abaikan error "wajib diisi", tetapi tolak isian yang salah format/logika.
    const blocking = status === 'draft' ? Object.fromEntries(Object.entries(allErrs).filter(([, msg]) => !/wajib|^Pilih|minimal 50/i.test(msg))) : allErrs
    if (status === 'draft' && !v.title.trim()) blocking.title = 'Judul wajib diisi untuk menyimpan draft.'
    if (Object.keys(blocking).length) {
      setErrors(blocking)
      const first = [0, 1, 3, 4].find((s) => Object.keys(validateStep(s, v)).some((k) => k in blocking))
      if (first != null) setStep(first)
      return toast.error('Ada isian yang perlu diperbaiki.')
    }
    setSaving(status)
    try {
      await saveEvent(user.id, { ...v, status })
      setDirty(false)
      toast.success(status === 'published' ? 'Event diterbitkan dan tampil di katalog.' : 'Perubahan disimpan.')
      navigate('/organizer/events', { replace: true })
    } catch (e) {
      setFormError(friendlyError(e))
    } finally {
      setSaving('')
    }
  }

  if (existing.loading || cats.loading || regions.loading) return <Spinner />
  if (existing.error) return <ErrorState message={existing.error} onRetry={existing.reload} />
  if (isEdit && !existing.data) return <EmptyState title="Event tidak ditemukan" description="Event ini tidak ada atau bukan milik akunmu." action={<Button to="/organizer/events">Kembali</Button>} />

  const ready = publishChecklist(v).every((c) => c.ok)
  const StepView = [StepDetail, StepLocation, StepMedia, StepProgram, StepPublish][step]
  const isPublished = v.status === 'published'

  return (
    <>
      <div className="page-head">
        <div>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/organizer/events">Kelola event</Link><ChevronRight aria-hidden="true" /><span>{isEdit ? 'Edit' : 'Tambah'}</span>
          </nav>
          <div className="row">
            <h1>{isEdit ? v.title || 'Edit event' : 'Tambah event baru'}</h1>
            {isEdit && <StatusBadge status={v.status} archived={v.archived_at} />}
          </div>
          <p>Isi berurutan dari detail sampai publikasi. Data tersimpan saat kamu menekan Simpan.</p>
        </div>
        {isEdit && isPublished && <Button variant="secondary" to={`/events/${v.slug}`} target="_blank"><Eye /> Lihat halaman</Button>}
      </div>

      <div className="steps" role="list" aria-label="Langkah pengisian">
        {STEPS.map((s, i) => (
          <button key={s} type="button" role="listitem" aria-current={step === i ? 'step' : undefined} className={visited.has(i) && i !== step && !Object.keys(validateStep(i, v)).length ? 'is-done' : ''} onClick={() => (visited.has(i) || i < step ? goto(i) : goto(i))}>
            <i>{visited.has(i) && i !== step && !Object.keys(validateStep(i, v)).length ? <Check size={14} /> : i + 1}</i>
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        <h2 className="card__title" style={{ marginBottom: 'var(--sp-5)' }}>{step + 1}. {STEPS[step]}</h2>
        {formError && <div style={{ marginBottom: 16 }}><Alert>{formError}</Alert></div>}
        <StepView v={v} set={set} patch={patch} errors={errors} categories={cats.data || []} regions={regions.data || []} slugTouched={slugTouched} setSlugTouched={setSlugTouched} />
      </div>

      <div className="form-actions">
        <Button variant="secondary" onClick={() => goto(step - 1)} disabled={step === 0}><ArrowLeft /> Sebelumnya</Button>
        <div className="row">
          {!isPublished && <Button variant="secondary" onClick={() => save('draft')} loading={saving === 'draft'} disabled={!!saving}><Save /> Simpan draft</Button>}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => goto(step + 1)}>Lanjut <ArrowRight /></Button>
          ) : isPublished ? (
            <Button variant="accent" onClick={() => save('published')} loading={saving === 'published'} disabled={!ready || !!saving}><Save /> Simpan perubahan</Button>
          ) : (
            <Button variant="accent" onClick={() => save('published')} loading={saving === 'published'} disabled={!ready || !!saving}><Send /> Terbitkan event</Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
        title="Tinggalkan halaman?"
        message="Perubahan yang belum disimpan akan hilang."
        confirmLabel="Tinggalkan"
      />
    </>
  )
}
