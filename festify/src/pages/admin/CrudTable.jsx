import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Spinner, ErrorState, EmptyState, Alert } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/context/ToastContext'
import { friendlyError } from '@/utils/errors'

/**
 * Tabel CRUD sederhana untuk data referensi (kategori, wilayah).
 * columns: [{ key, label, render? }], Form: komponen ({ value, onChange }) => JSX
 */
export default function CrudTable({ title, description, noun, load, save, remove, columns, Form, empty }) {
  const toast = useToast()
  const list = useAsync(load, [])
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e?.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await save(editing)
      toast.success(`${noun} disimpan.`)
      setEditing(null)
      list.reload()
    } catch (e2) {
      setErr(friendlyError(e2))
    } finally {
      setBusy(false)
    }
  }

  const doDelete = async () => {
    setBusy(true)
    try {
      await remove(deleting.id)
      toast.success(`${noun} dihapus.`)
      setDeleting(null)
      list.reload()
    } catch (e) {
      toast.error(friendlyError(e))
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Button onClick={() => { setEditing(empty); setErr('') }}><Plus /> Tambah {noun.toLowerCase()}</Button>
      </div>
      <div className="card card--flush">
        {list.loading ? <Spinner /> : list.error ? <ErrorState compact message={list.error} onRetry={list.reload} /> : !list.data.length ? (
          <EmptyState compact title={`Belum ada ${noun.toLowerCase()}`} />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th><span className="sr-only">Aksi</span></th></tr></thead>
              <tbody>
                {list.data.map((row) => (
                  <tr key={row.id}>
                    {columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key] || '–'}</td>)}
                    <td>
                      <div className="table__actions">
                        <Button variant="ghost" size="sm" icon onClick={() => { setEditing(row); setErr('') }} aria-label={`Edit ${noun}`}><Pencil /></Button>
                        <Button variant="ghost" size="sm" icon onClick={() => setDeleting(row)} aria-label={`Hapus ${noun}`}><Trash2 /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? `Edit ${noun.toLowerCase()}` : `Tambah ${noun.toLowerCase()}`} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button><Button onClick={submit} loading={busy}>Simpan</Button></>}>
        {editing && (
          <form className="stack" onSubmit={submit} noValidate>
            {err && <Alert>{err}</Alert>}
            <Form value={editing} onChange={(p) => setEditing((x) => ({ ...x, ...p }))} />
            <button type="submit" hidden />
          </form>
        )}
      </Modal>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} loading={busy} title={`Hapus ${noun.toLowerCase()}?`} message={`Data yang masih dipakai event tidak dapat dihapus.`} confirmLabel="Hapus" />
    </>
  )
}
