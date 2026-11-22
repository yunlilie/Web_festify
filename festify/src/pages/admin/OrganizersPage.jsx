import { useState } from 'react'
import { Search, BadgeCheck, ExternalLink, UserMinus } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listOrganizers, setUserRole } from '@/services/adminService'
import { friendlyError } from '@/utils/errors'

export default function OrganizersPage() {
  useDocumentTitle('Organizer')
  const { user } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const dq = useDebounce(q)
  const list = useAsync(() => listOrganizers({ q: dq }), [dq])
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const revoke = async () => {
    setBusy(true)
    try {
      await setUserRole(user.id, target.id, 'user')
      toast.success(`Akses organizer ${target.organization_name} dicabut.`)
      setTarget(null)
      list.reload()
    } catch (e) {
      toast.error(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Organizer</h1>
          <p>Akun organizer aktif langsung saat mendaftar. Admin dapat mencabut akses bila terjadi pelanggaran.</p>
        </div>
      </div>
      <div className="card card--flush">
        <div style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="input-icon" style={{ maxWidth: 360 }}>
            <Search aria-hidden="true" />
            <input className="input" type="search" placeholder="Cari organizer" aria-label="Cari organizer" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {list.loading ? <Spinner /> : list.error ? <ErrorState compact message={list.error} onRetry={list.reload} /> : !list.data.length ? (
          <EmptyState compact icon={BadgeCheck} title="Belum ada organizer" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Organizer</th><th>Kontak</th><th>Total event</th><th>Published</th><th><span className="sr-only">Aksi</span></th></tr></thead>
              <tbody>
                {list.data.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="row" style={{ flexWrap: 'nowrap' }}>
                        <Avatar src={o.logo_url} name={o.organization_name} size="sm" />
                        <div><strong style={{ display: 'block' }}>{o.organization_name}</strong><span className="text-xs text-muted">{o.email}</span></div>
                      </div>
                    </td>
                    <td className="text-sm">{[o.phone, o.instagram].filter(Boolean).join(' · ') || '–'}</td>
                    <td>{o.total_events}</td>
                    <td>{o.published}</td>
                    <td>
                      <div className="table__actions">
                        <Button variant="ghost" size="sm" icon to={`/organizers/${o.id}`} aria-label="Profil publik" title="Profil publik"><ExternalLink /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setTarget(o)}><UserMinus /> Cabut akses</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog open={!!target} onClose={() => setTarget(null)} onConfirm={revoke} loading={busy} title="Cabut akses organizer?" message={`${target?.organization_name} akan kembali menjadi User dan tidak bisa mengelola event. Event yang sudah ada tetap tersimpan.`} confirmLabel="Cabut akses" />
    </>
  )
}
