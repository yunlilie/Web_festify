import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import FileDrop from '@/components/ui/FileDrop'
import { Input, Textarea } from '@/components/ui/Field'
import { Spinner, ErrorState, Alert } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getOrganizerProfile, updateOrganizerProfile } from '@/services/profileService'
import { uploadFile } from '@/services/storageService'
import { isHttpsUrl } from '@/utils/validators'
import { friendlyError } from '@/utils/errors'

export default function OrganizerProfilePage() {
  useDocumentTitle('Profil organizer')
  const { user } = useAuth()
  const toast = useToast()
  const org = useAsync(() => getOrganizerProfile(user.id), [user.id])
  const [v, setV] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  useEffect(() => {
    if (org.data) setV(org.data)
  }, [org.data])

  if (org.loading || !v) return org.error ? <ErrorState message={org.error} onRetry={org.reload} /> : <Spinner />
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

  const upLogo = async ([f]) => {
    try {
      const { url } = await uploadFile(f, { kind: 'image' })
      setV((x) => ({ ...x, logo_url: url }))
    } catch (e) {
      toast.error(friendlyError(e))
    }
  }

  const save = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!v.organization_name?.trim()) errs.organization_name = 'Nama organizer wajib diisi.'
    if (v.website_url && !isHttpsUrl(v.website_url)) errs.website_url = 'Gunakan URL https://'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    setFormErr('')
    try {
      await updateOrganizerProfile(user.id, v)
      toast.success('Profil organizer disimpan.')
    } catch (err) {
      setFormErr(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profil organizer</h1>
          <p>Identitas brand yang tampil di setiap halaman event milikmu.</p>
        </div>
        <Button variant="secondary" to={`/organizers/${user.id}`}><ExternalLink /> Lihat profil publik</Button>
      </div>
      <form className="profile-card" onSubmit={save} noValidate>
        <div className="card profile-side">
          <Avatar src={v.logo_url} name={v.organization_name} size="lg" />
          <FileDrop kind="image" onFiles={upLogo} onError={toast.error} label="Ganti logo" />
        </div>
        <div className="card stack">
          {formErr && <Alert>{formErr}</Alert>}
          <Input label="Nama organizer" required value={v.organization_name || ''} onChange={set('organization_name')} error={errors.organization_name} maxLength={100} />
          <Textarea label="Tentang organizer" rows={4} value={v.bio || ''} onChange={set('bio')} maxLength={500} />
          <div className="form-grid form-grid--2">
            <Input label="No. telepon" type="tel" value={v.phone || ''} onChange={set('phone')} />
            <Input label="Instagram" value={v.instagram || ''} onChange={set('instagram')} placeholder="@namaakun" />
          </div>
          <Input label="Situs web" type="url" value={v.website_url || ''} onChange={set('website_url')} error={errors.website_url} placeholder="https://" />
          <Input label="Email akun" value={v.email} disabled />
          <div><Button type="submit" loading={saving}>Simpan profil</Button></div>
        </div>
      </form>
    </>
  )
}
