import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Alert } from '@/components/ui/States'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { isEmail } from '@/utils/validators'
import { friendlyError } from '@/utils/errors'

export default function ForgotPasswordPage() {
  useDocumentTitle('Lupa password')
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!isEmail(email)) return setError('Masukkan email yang valid.')
    setError('')
    setLoading(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent)
    return (
      <div className="state" style={{ padding: 0 }}>
        <div className="state__icon"><MailCheck /></div>
        <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Periksa email kamu</h1>
        <p className="state__desc">Jika <strong>{email}</strong> terdaftar, kami telah mengirim tautan untuk mengatur ulang password. Tautan berlaku 1 jam.</p>
        <Button to="/login" variant="secondary">Kembali ke halaman masuk</Button>
      </div>
    )

  return (
    <>
      <div>
        <h1>Lupa password?</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} required />
        <Button type="submit" size="lg" block loading={loading}>Kirim tautan reset</Button>
      </form>
      <p className="auth__foot">Ingat password? <Link to="/login">Masuk</Link></p>
    </>
  )
}
