import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function Gallery({ items = [] }) {
  const [open, setOpen] = useState(null)
  const photos = items.filter((m) => m.file_type === 'image')

  useEffect(() => {
    if (open == null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % photos.length)
      if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + photos.length) % photos.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, photos.length])

  if (!photos.length) return null
  return (
    <>
      <div className="gallery">
        {photos.map((m, i) => (
          <button key={m.id} type="button" onClick={() => setOpen(i)} aria-label={`Buka foto ${i + 1}${m.caption ? `: ${m.caption}` : ''}`}>
            <img src={m.file_url} alt={m.caption || `Foto ${i + 1}`} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      {open != null &&
        createPortal(
          <div className="lightbox" role="dialog" aria-modal="true" aria-label="Galeri foto" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
            <button type="button" className="lightbox__close" onClick={() => setOpen(null)} aria-label="Tutup"><X /></button>
            {photos.length > 1 && (
              <>
                <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => setOpen((open - 1 + photos.length) % photos.length)} aria-label="Sebelumnya"><ChevronLeft /></button>
                <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => setOpen((open + 1) % photos.length)} aria-label="Berikutnya"><ChevronRight /></button>
              </>
            )}
            <img src={photos[open].file_url} alt={photos[open].caption || ''} />
            <p className="lightbox__cap">{photos[open].caption} · {open + 1}/{photos.length}</p>
          </div>,
          document.body,
        )}
    </>
  )
}
