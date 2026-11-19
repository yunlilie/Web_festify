import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Input, PasswordInput, Checkbox } from '@/components/ui/Field'
import { Alert } from '@/components/ui/States'
import GoogleButton from './GoogleButton'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { isEmail, passwordIssues, validate, required, minLen, maxLen } from '@/utils/validators'
import { friendlyError } from '@/utils/errors'

const TYPES = [
  { value: 'user', title: 'User', desc: 'Cari event, simpan favorit, beri ulasan.' },
  { value: 'organizer', title: 'Event Organizer', desc: 'Promosikan dan kelola event.' },
]

export default function RegisterPage() {
  useDocumentTitle('Daftar')
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [values, setValues] = useState({
    accountType: params.get('type') === 'organizer' ? 'organizer' : 'user',
    fullName: '', organizationName: '', email: '', password: '', confirm: '', agree: false,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const pwIssues = passwordIssues(values.password)

  const submit = async (e) => {
    e.preventDefault()
    setFormError('')
    const errs = validate(values, {
      fullName: [required('Nama lengkap'), minLen(2, 'Nama'), maxLen(80, 'Nama')],
      ...(values.accountType === 'organizer' ? { organizationName: [required('Nama organizer'), maxLen(100, 'Nama organizer')] } : {}),
      email: [required('Email'), (v) => (!isEmail(v) ? 'Format email tidak valid.' : null)],
      password: [required('Password'), (v) => (passwordIssues(v).length ? `Password harus ${passwordIssues(v).join(', ')}.` : null)],
      confirm: [required('Konfirmasi password'), (v, all) => (v !== all.password ? 'Konfirmasi password tidak sama.' : null)],
      agree: [(v) => (!v ? 'Kamu perlu menyetujui Syarat & Ketentuan serta Kebijakan Privasi.' : null)],
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      const res = await signUp(values)
      navigate('/verify-email', { replace: true, state: { email: res.email } })
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <h1>Buat akun Festify</h1>
        <p className="text-muted" style={{ marginTop: 8 }}>Gratis. Pilih jenis akun sesuai kebutuhanmu.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <div className="segment" role="group" aria-label="Jenis akun">
          {TYPES.map((t) => (
            <button key={t.value} type="button" className="segment__opt" aria-pressed={values.accountType === t.value} onClick={() => setValues((v) => ({ ...v, accountType: t.value }))}>
              <strong>{t.title}</strong>
              <span>{t.desc}</span>
            </button>
          ))}
        </div>
        {formError && <Alert>{formError}</Alert>}
        <Input label="Nama lengkap" autoComplete="name" value={values.fullName} onChange={set('fullName')} error={errors.fullName} required />
        {values.accountType === 'organizer' && (
          <Input label="Nama organizer / brand" hint="Ditampilkan di halaman event. Bisa diubah nanti." value={values.organizationName} onChange={set('organizationName')} error={errors.organizationName} required />
        )}
        <Input label="Email" type="email" autoComplete="email" placeholder="nama@email.com" value={values.email} onChange={set('email')} error={errors.email} required />
        <PasswordInput
          autoComplete="new-password"
          value={values.password}
          onChange={set('password')}
          error={errors.password}
          required
          hint={values.password ? (pwIssues.length ? `Belum: ${pwIssues.join(', ')}` : 'Password kuat ✓') : 'Minimal 8 karakter, berisi huruf dan angka.'}
        />
        <PasswordInput id="confirm" label="Konfirmasi password" autoComplete="new-password" value={values.confirm} onChange={set('confirm')} error={errors.confirm} required />
        <Checkbox checked={values.agree} onChange={set('agree')} error={errors.agree}>
          Saya menyetujui <Link className="link" to="/syarat-ketentuan" target="_blank">Syarat &amp; Ketentuan</Link> dan <Link className="link" to="/kebijakan-privasi" target="_blank">Kebijakan Privasi</Link>.
        </Checkbox>
        <Button type="submit" size="lg" block loading={loading}>Daftar</Button>
      </form>
      {values.accountType === 'user' && (
        <>
          <div className="divider">atau</div>
          <GoogleButton label="Daftar dengan Google" />
        </>
      )}
      <p className="auth__foot">Sudah punya akun? <Link to="/login">Masuk</Link></p>
    </>
  )
}
