import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

/** Bar khusus Tahap 2 untuk meninjau UI per peran. Dihapus pada Tahap 4. */
export default function PreviewBar() {
  const { profile, previewAs } = useAuth()
  const navigate = useNavigate()
  if (isSupabaseConfigured) return null
  const go = (e) => {
    const v = e.target.value
    previewAs(v)
    if (v === 'u-org1') navigate('/organizer')
    else if (v === 'u-admin') navigate('/admin')
  }
  return (
    <div className="preview-bar">
      <div className="container">
        <Eye size={14} aria-hidden="true" />
        <span><strong>Mode pratinjau desain</strong> — data contoh, belum terhubung ke Supabase.</span>
        <label className="row" style={{ gap: 6, marginLeft: 'auto' }}>
          Lihat sebagai
          <select value={profile?.id || ''} onChange={go}>
            <option value="">Pengunjung</option>
            <option value="u-user">User</option>
            <option value="u-org1">Organizer</option>
            <option value="u-admin">Admin</option>
          </select>
        </label>
      </div>
    </div>
  )
}
