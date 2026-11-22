import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Megaphone, BarChart3, MessageSquareReply } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Alert } from '@/components/ui/States'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { becomeOrganizer } from '@/services/profileService'
import { friendlyError } from '@/utils/errors'

export default function BecomeOrganizerPage() {
  useDocumentTitle('Jadi organizer')
  const { profile, refreshProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [v, setV] = useState({ organization_name: profile.full_name, bio: '', phone: '', instagram: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (profile.role !== 'user') return <Navigate to={profile.role === 'admin' ? '/admin' : '/organizer'} replace />

  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    if (!v.organization_name.trim()) return setError('Nama organizer wajib diisi.')
    setLoading(true)
    setError('')
    try {
      await becomeOrganizer(profile.id, v)
      refreshProfile()
      toast.success('Akun organizer aktif! Selamat datang di dashboard.')
      navigate('/organizer', { replace: true })
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <header className="page-title">
        <h1>Promosikan event-mu di Festify</h1>
        <p>Aktifkan akun organizer untuk membuat event, mengunggah media, dan memantau statistik.</p>
      </header>
      <div className="profile-card">
        <div className="card stack">
          {[[Megaphone, 'Tampil di katalog', 'Event published muncul di pencarian & beranda.'], [BarChart3, 'Statistik lengkap', 'Views, favorit, klik tiket, dan CTR.'], [MessageSquareReply, 'Balas ulasan', 'Jaga reputasi dengan merespons pengunjung.']].map(([I, t, d]) => (
            <div key={t} className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <span className="stat__icon"><I /></span>
              <div><strong className="text-sm">{t}</strong><p className="text-xs text-muted">{d}</p></div>
            </div>
          ))}
        </div>
        <form className="card stack" onSubmit={submit} noValidate>
          {error && <Alert>{error}</Alert>}
          <Input label="Nama organizer / brand" value={v.organization_name} onChange={set('organization_name')} required maxLength={100} />
          <Textarea label="Deskripsi singkat" value={v.bio} onChange={set('bio')} maxLength={500} placeholder="Ceritakan tentang organisasimu" />
          <div className="form-grid form-grid--2">
            <Input label="No. telepon" type="tel" value={v.phone} onChange={set('phone')} />
            <Input label="Instagram" value={v.instagram} onChange={set('instagram')} placeholder="@namaakun" />
          </div>
          <Button type="submit" loading={loading}>Aktifkan akun organizer</Button>
        </form>
      </div>
    </div>
  )
}
