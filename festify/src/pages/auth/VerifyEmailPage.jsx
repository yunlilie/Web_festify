import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function VerifyEmailPage() {
  useDocumentTitle('Verifikasi email')
  const { state } = useLocation()
  const toast = useToast()
  const [cooldown, setCooldown] = useState(0)

  // Tahap 4: supabase.auth.resend({ type: 'signup', email })
  const resend = () => {
    toast.success('Email verifikasi dikirim ulang.')
    setCooldown(60)
    const t = setInterval(() => setCooldown((c) => (c <= 1 ? (clearInterval(t), 0) : c - 1)), 1000)
  }

  return (
    <div className="state" style={{ padding: 0 }}>
      <div className="state__icon"><MailCheck /></div>
      <h1 style={{ fontSize: 'var(--fs-2xl)' }}>Cek email kamu</h1>
      <p className="state__desc">
        Kami mengirim tautan verifikasi ke <strong>{state?.email || 'email kamu'}</strong>. Klik tautan tersebut untuk mengaktifkan akun, lalu masuk kembali.
      </p>
      <p className="text-xs text-muted">Tidak menemukan email? Periksa folder spam atau promosi.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Button variant="secondary" onClick={resend} disabled={!state?.email || cooldown > 0}>
          {cooldown ? `Kirim ulang (${cooldown}s)` : 'Kirim ulang email'}
        </Button>
        <Button to="/login">Ke halaman masuk</Button>
      </div>
    </div>
  )
}
