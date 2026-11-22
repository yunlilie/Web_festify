import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, LogOut, Trash2, KeyRound } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { RoleBadge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/States'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { updateProfile } from '@/services/profileService'
import { uploadFile } from '@/services/storageService'
import { validateFile } from '@/utils/validators'
import { formatDate } from '@/utils/format'
import { friendlyError } from '@/utils/errors'
import { FILE_RULES } from '@/utils/constants'

export default function ProfilePage() {
  useDocumentTitle('Profil saya')
  const { profile, signOut, refreshProfile, sendPasswordReset } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [name, setName] = useState(profile.full_name)
  const [avatar, setAvatar] = useState(profile.avatar_url)
  const [pendingFile, setPendingFile] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const pick = (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    const err = validateFile(f, 'image')
    if (err) return toast.error(err)
    setPendingFile(f)
    setAvatar(URL.createObjectURL(f)) // pratinjau sebelum upload
  }

  const dirty = name.trim() !== profile.full_name || pendingFile || avatar !== profile.avatar_url

  const save = async (e) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError('Nama minimal 2 karakter.')
    setSaving(true)
    try {
      let avatar_url = avatar
      if (pendingFile) avatar_url = (await uploadFile(pendingFile, { kind: 'image' })).url
      await updateProfile(profile.id, { full_name: name, avatar_url })
      setPendingFile(null)
      refreshProfile()
      toast.success('Profil diperbarui.')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    try {
      await sendPasswordReset(profile.email)
      toast.success('Tautan ganti password dikirim ke email kamu.')
    } catch (err) {
      toast.error(friendlyError(err))
    }
  }

  return (
    <div className="container" style={{ maxWidth: 960 }}>
      <header className="page-title">
        <h1>Profil saya</h1>
        <p>Kelola informasi akun yang tampil di ulasanmu.</p>
      </header>
      <div className="profile-card">
        <div className="card profile-side">
          <Avatar src={avatar} name={name} size="lg" />
          <div>
            <strong style={{ display: 'block' }}>{profile.full_name}</strong>
            <span className="text-sm text-muted">{profile.email}</span>
          </div>
          <RoleBadge role={profile.role} />
          <span className="text-xs text-muted">Bergabung {formatDate(profile.created_at)}</span>
          <div className="row" style={{ justifyContent: 'center' }}>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Camera /> Ganti foto</Button>
            {avatar && <Button variant="ghost" size="sm" onClick={() => { setAvatar(null); setPendingFile(null) }} aria-label="Hapus foto"><Trash2 /></Button>}
          </div>
          <input ref={fileRef} type="file" hidden accept={FILE_RULES.image.types.join(',')} onChange={pick} />
          <span className="text-xs text-muted">{FILE_RULES.image.label}</span>
        </div>

        <form className="card stack" onSubmit={save} noValidate>
          <h2 className="card__title">Informasi akun</h2>
          {error && <Alert>{error}</Alert>}
          <Input label="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          <Input label="Email" value={profile.email} disabled hint="Email tidak bisa diubah dari halaman ini." />
          <div className="row-between">
            <Button variant="ghost" onClick={reset}><KeyRound /> Ganti password</Button>
            <Button type="submit" loading={saving} disabled={!dirty}>Simpan perubahan</Button>
          </div>
          <hr style={{ border: 0, borderTop: '1px solid var(--border)', width: '100%' }} />
          <div className="row-between">
            <div>
              <strong className="text-sm">Keluar dari akun</strong>
              <p className="text-xs text-muted">Sesi di perangkat ini akan diakhiri.</p>
            </div>
            <Button variant="secondary" onClick={async () => { await signOut(); navigate('/') }}><LogOut /> Keluar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
