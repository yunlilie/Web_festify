import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Input, PasswordInput } from '@/components/ui/Field'
import { Alert } from '@/components/ui/States'
import GoogleButton from './GoogleButton'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { isEmail, validate, required } from '@/utils/validators'
import { friendlyError } from '@/utils/errors'

export default function LoginPage() {
  useDocumentTitle('Masuk')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errs = validate(values, {
      email: [required('Email'), (v) => (!isEmail(v) ? 'Format email tidak valid.' : null)],
      password: [required('Password')],
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      const p = await signIn(values)
      const home = p.role === 'admin' ? '/admin' : p.role === 'organizer' ? '/organizer' : '/'
      const from = location.state?.from
      // Kembali ke halaman asal hanya jika role-nya berhak membuka halaman tersebut.
      const allowed = from && !(from.startsWith('/admin') && p.role !== 'admin') && !(from.startsWith('/organizer') && p.role !== 'organizer')
      navigate(allowed ? from : home, { replace: true })
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <h1>Selamat datang kembali</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>Masuk untuk menyimpan favorit, memberi ulasan, atau mengelola event.</p>
      </div>
      <GoogleButton />
      <div className="divider">atau dengan email</div>
      <form className="stack" onSubmit={submit} noValidate>
        {formError && <Alert>{formError}</Alert>}
        <Input label="Email" type="email" autoComplete="email" placeholder="nama@email.com" value={values.email} onChange={set('email')} error={errors.email} required />
        <PasswordInput autoComplete="current-password" placeholder="Masukkan password" value={values.password} onChange={set('password')} error={errors.password} required />
        <div style={{ textAlign: 'right', marginTop: -8 }}>
          <Link to="/forgot-password" className="link text-sm">Lupa password?</Link>
        </div>
        <Button type="submit" size="lg" block loading={loading}>Masuk</Button>
      </form>
      <p className="auth__foot">Belum punya akun? <Link to="/register" state={location.state}>Daftar gratis</Link></p>
    </>
  )
}
