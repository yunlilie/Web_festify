import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Field'
import { Alert } from '@/components/ui/States'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { passwordIssues } from '@/utils/validators'
import { friendlyError } from '@/utils/errors'

/** Dibuka dari tautan email reset (Supabase mengirim event PASSWORD_RECOVERY). */
export default function ResetPasswordPage() {
  useDocumentTitle('Atur ulang password')
  const { updatePassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const issues = passwordIssues(pw)
    const errs = {}
    if (issues.length) errs.pw = `Password harus ${issues.join(', ')}.`
    if (confirm !== pw) errs.confirm = 'Konfirmasi password tidak sama.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      await updatePassword(pw)
      toast.success('Password berhasil diperbarui. Silakan masuk.')
      navigate('/login', { replace: true })
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <h1>Buat password baru</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        {formError && <Alert>{formError}</Alert>}
        <PasswordInput label="Password baru" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={errors.pw} required />
        <PasswordInput id="confirm-new" label="Konfirmasi password baru" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} required />
        <Button type="submit" size="lg" block loading={loading}>Simpan password</Button>
      </form>
    </>
  )
}
