import { useState } from 'react'
import { Search, UserCog, Users } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { RoleBadge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Spinner, ErrorState, EmptyState, Alert } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listUsers, setUserRole } from '@/services/adminService'
import { formatDate } from '@/utils/format'
import { ROLE_LABEL } from '@/utils/constants'
import { friendlyError } from '@/utils/errors'

export default function UsersPage() {
  useDocumentTitle('Manajemen pengguna')
  const { user } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const dq = useDebounce(q)
  const list = useAsync(() => listUsers({ q: dq, role }), [dq, role])
  const [edit, setEdit] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const save = async () => {
    setBusy(true)
    setErr('')
    try {
      await setUserRole(user.id, edit.id, newRole)
      toast.success(`Role ${edit.full_name} diubah menjadi ${ROLE_LABEL[newRole]}.`)
      setEdit(null)
      list.reload()
    } catch (e) {
      setErr(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pengguna</h1>
          <p>Perubahan role hanya bisa dilakukan admin lewat fungsi backend yang aman.</p>
        </div>
      </div>
      <div className="card card--flush">
        <div className="row" style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="input-icon grow" style={{ maxWidth: 360 }}>
            <Search aria-hidden="true" />
            <input className="input" type="search" placeholder="Cari nama atau email" aria-label="Cari pengguna" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="select" style={{ width: 'auto' }} aria-label="Filter role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Semua role</option>
            {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        {list.loading ? <Spinner /> : list.error ? <ErrorState compact message={list.error} onRetry={list.reload} /> : !list.data.length ? (
          <EmptyState compact icon={Users} title="Pengguna tidak ditemukan" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Pengguna</th><th>Role</th><th>Event</th><th>Bergabung</th><th><span className="sr-only">Aksi</span></th></tr></thead>
              <tbody>
                {list.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="row" style={{ flexWrap: 'nowrap' }}>
                        <Avatar src={p.avatar_url} name={p.full_name} size="sm" />
                        <div><strong style={{ display: 'block' }}>{p.full_name}</strong><span className="text-xs text-muted">{p.email}</span></div>
                      </div>
                    </td>
                    <td><RoleBadge role={p.role} /></td>
                    <td>{p.events || '–'}</td>
                    <td>{formatDate(p.created_at)}</td>
                    <td>
                      <div className="table__actions">
                        <Button variant="ghost" size="sm" onClick={() => { setEdit(p); setNewRole(p.role); setErr('') }} disabled={p.id === user.id} title={p.id === user.id ? 'Tidak dapat mengubah akun sendiri' : undefined}>
                          <UserCog /> Ubah role
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Ubah role pengguna" footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Batal</Button><Button onClick={save} loading={busy} disabled={newRole === edit?.role}>Simpan</Button></>}>
        {edit && (
          <div className="stack">
            <p className="text-sm">Pengguna: <strong>{edit.full_name}</strong> ({edit.email})</p>
            <Select label="Role baru" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            {newRole === 'admin' && <Alert tone="warning">Admin memiliki akses penuh ke seluruh data platform. Pastikan pengguna ini tepercaya.</Alert>}
            {edit.role === 'organizer' && newRole === 'user' && edit.events > 0 && <Alert tone="warning">Pengguna ini memiliki {edit.events} event. Event tetap ada, tetapi ia tidak bisa mengelolanya lagi.</Alert>}
            {err && <Alert>{err}</Alert>}
          </div>
        )}
      </Modal>
    </>
  )
}
