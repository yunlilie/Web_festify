import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/States'

/** Wajib login. Pengguna yang belum login diarahkan ke /login lalu kembali ke halaman asal (REQ-4.1.8). */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}

/**
 * Wajib role tertentu. Ini lapisan UX — keamanan sebenarnya ada di RLS Supabase,
 * sehingga walau route dibobol, query data tetap ditolak database.
 */
export function RoleRoute({ allow }) {
  const { role, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!allow.includes(role)) return <Navigate to="/403" replace />
  return <Outlet />
}

/** Halaman tamu (login/register) — pengguna yang sudah login diarahkan sesuai role. */
export function GuestRoute() {
  const { isAuthenticated, role, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner />
  if (isAuthenticated) {
    const from = location.state?.from
    const home = role === 'admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/'
    return <Navigate to={from && !from.startsWith('/login') ? from : home} replace />
  }
  return <Outlet />
}
