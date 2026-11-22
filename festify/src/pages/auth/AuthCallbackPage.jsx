import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/States'
import { useAuth } from '@/context/AuthContext'

/**
 * Tujuan redirect Google OAuth & tautan verifikasi email.
 * Tahap 4: Supabase menukar `code` (PKCE) menjadi sesi, lalu kita arahkan sesuai role.
 */
export default function AuthCallbackPage() {
  const { loading, role, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) navigate('/login', { replace: true })
    else navigate(role === 'admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/', { replace: true })
  }, [loading, isAuthenticated, role, navigate])
  return <Spinner label="Menyelesaikan proses masuk…" />
}
