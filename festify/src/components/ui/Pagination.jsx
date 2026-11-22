import { ChevronLeft, ChevronRight } from 'lucide-react'

const range = (page, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, page, page - 1, page + 1])
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  list.forEach((p, i) => {
    if (i && p - list[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.ceil(total / pageSize)
  if (pages <= 1) return null
  return (
    <nav className="pagination" aria-label="Navigasi halaman">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Halaman sebelumnya">
        <ChevronLeft />
      </button>
      {range(page, pages).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="text-muted" aria-hidden="true">…</span>
        ) : (
          <button key={p} type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
            {p}
          </button>
        ),
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Halaman berikutnya">
        <ChevronRight />
      </button>
    </nav>
  )
}
