import { useState } from 'react'
import { Plus, X, Ban } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Spinner, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listBlockedWords, addBlockedWord, removeBlockedWord } from '@/services/reviewService'
import { friendlyError } from '@/utils/errors'

export default function BlockedWordsPage() {
  useDocumentTitle('Kata terlarang')
  const toast = useToast()
  const list = useAsync(listBlockedWords, [])
  const [word, setWord] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await addBlockedWord(word)
      setWord('')
      toast.success('Kata ditambahkan.')
      list.reload()
    } catch (e2) {
      setErr(friendlyError(e2))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (w) => {
    try {
      await removeBlockedWord(w.id)
      list.reload()
    } catch (e) {
      toast.error(friendlyError(e))
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kata terlarang</h1>
          <p>Ulasan dan balasan yang mengandung kata di bawah ini otomatis ditolak oleh database (REQ-4.6.3).</p>
        </div>
      </div>
      <div className="card stack">
        <form className="row" style={{ alignItems: 'flex-end' }} onSubmit={add} noValidate>
          <Input className="grow" label="Tambah kata atau frasa" value={word} onChange={(e) => setWord(e.target.value)} error={err} maxLength={50} style={{ maxWidth: 360 }} />
          <Button type="submit" loading={busy} disabled={!word.trim()}><Plus /> Tambah</Button>
        </form>
        {list.loading ? <Spinner /> : list.error ? <ErrorState compact message={list.error} onRetry={list.reload} /> : !list.data.length ? (
          <EmptyState compact icon={Ban} title="Daftar masih kosong" />
        ) : (
          <div className="row" style={{ gap: 8 }}>
            {list.data.map((w) => (
              <span key={w.id} className="chip" style={{ paddingRight: 6 }}>
                {w.word}
                <button type="button" onClick={() => remove(w)} aria-label={`Hapus ${w.word}`} style={{ border: 0, background: 'none', display: 'grid', placeItems: 'center', padding: 4, borderRadius: 999 }}><X size={14} /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
