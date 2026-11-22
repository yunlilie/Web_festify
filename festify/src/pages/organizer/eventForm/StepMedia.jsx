import { useState } from 'react'
import { X, Star, Youtube } from 'lucide-react'
import FileDrop from '@/components/ui/FileDrop'
import Poster from '@/components/ui/Poster'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import { uploadFile, removeFile } from '@/services/storageService'
import { youtubeEmbed } from '@/utils/format'
import { friendlyError } from '@/utils/errors'

export default function StepMedia({ v, patch, errors }) {
  const toast = useToast()
  const [busy, setBusy] = useState('')
  const [link, setLink] = useState('')
  const [linkErr, setLinkErr] = useState('')

  const upPoster = async ([f]) => {
    setBusy('poster')
    try {
      const { url } = await uploadFile(f, { kind: 'image' })
      patch({ poster_url: url })
    } catch (e) {
      toast.error(friendlyError(e))
    } finally {
      setBusy('')
    }
  }

  const upMany = (kind) => async (files) => {
    setBusy(kind)
    try {
      const uploaded = []
      for (const f of files) {
        const { url } = await uploadFile(f, { kind })
        uploaded.push({ file_type: kind, file_url: url, caption: '', is_primary: false })
      }
      patch({ media: [...v.media, ...uploaded] })
    } catch (e) {
      toast.error(friendlyError(e))
    } finally {
      setBusy('')
    }
  }

  const removeAt = async (i) => {
    await removeFile(v.media[i].file_url)
    patch({ media: v.media.filter((_, idx) => idx !== i) })
  }

  const addLink = () => {
    if (!youtubeEmbed(link)) return setLinkErr('Masukkan tautan YouTube yang valid.')
    setLinkErr('')
    patch({ media: [...v.media, { file_type: 'video_link', file_url: link.trim(), caption: '', is_primary: false }] })
    setLink('')
  }

  const caption = (i, text) => patch({ media: v.media.map((m, idx) => (idx === i ? { ...m, caption: text } : m)) })

  return (
    <div className="stack-lg">
      <section className="stack">
        <div>
          <strong>Poster utama <span style={{ color: 'var(--accent)' }}>*</span></strong>
          <p className="text-xs text-muted">Rasio 3:4 disarankan (misal 1080×1440 px). Poster tampil paling atas di halaman detail.</p>
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ width: 160 }}>
            <Poster src={v.poster_url} title={v.title || 'Poster event'} />
          </div>
          <div className="grow stack-sm" style={{ minWidth: 220 }}>
            <FileDrop kind="image" onFiles={upPoster} onError={toast.error} label={v.poster_url ? 'Ganti poster' : 'Unggah poster'} disabled={busy === 'poster'} />
            {v.poster_url && <Button variant="ghost" size="sm" onClick={() => patch({ poster_url: null })}><X /> Hapus poster</Button>}
            {busy === 'poster' && <span className="text-xs text-muted">Mengunggah…</span>}
            {errors.poster_url && <span className="field__error">{errors.poster_url}</span>}
          </div>
        </div>
      </section>

      <section className="stack">
        <div>
          <strong>Galeri foto</strong>
          <p className="text-xs text-muted">Dokumentasi event sebelumnya, venue, atau suasana. Bisa pilih beberapa sekaligus.</p>
        </div>
        <FileDrop kind="image" multiple onFiles={upMany('image')} onError={toast.error} label="Tambah foto" disabled={busy === 'image'} />
        {busy === 'image' && <span className="text-xs text-muted">Mengunggah foto…</span>}
      </section>

      <section className="stack">
        <div>
          <strong>Video preview</strong>
          <p className="text-xs text-muted">Unggah file video atau tempel tautan YouTube.</p>
        </div>
        <FileDrop kind="video" onFiles={upMany('video')} onError={toast.error} label="Unggah video" disabled={busy === 'video'} />
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <Input className="grow" label="Tautan YouTube" placeholder="https://youtube.com/watch?v=…" value={link} onChange={(e) => setLink(e.target.value)} error={linkErr} />
          <Button variant="secondary" onClick={addLink}><Youtube /> Tambah</Button>
        </div>
      </section>

      {v.media.length > 0 && (
        <section className="stack">
          <strong>Media terunggah ({v.media.length})</strong>
          <div className="media-grid">
            {v.media.map((m, i) => (
              <div key={`${m.file_url}-${i}`} className="stack-sm">
                <div className="media-tile">
                  {m.file_type === 'image' && <img src={m.file_url} alt={m.caption || `Media ${i + 1}`} />}
                  {m.file_type === 'video' && <video src={m.file_url} muted />}
                  {m.file_type === 'video_link' && <div className="state state--compact" style={{ height: '100%' }}><Youtube /></div>}
                  <button type="button" className="media-tile__rm" onClick={() => removeAt(i)} aria-label="Hapus media"><X /></button>
                  <span className="media-tile__tag"><Badge tone="glass">{m.file_type === 'image' ? 'Foto' : 'Video'}</Badge></span>
                </div>
                <input className="input" style={{ minHeight: 36 }} placeholder="Keterangan" aria-label={`Keterangan media ${i + 1}`} value={m.caption || ''} onChange={(e) => caption(i, e.target.value)} />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted row" style={{ gap: 6 }}><Star size={13} /> Urutan tampil mengikuti urutan unggah.</p>
        </section>
      )}
    </div>
  )
}
