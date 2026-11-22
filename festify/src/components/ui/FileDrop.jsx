import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { FILE_RULES } from '@/utils/constants'
import { validateFile } from '@/utils/validators'

/** Area drag & drop dengan validasi format/ukuran sebelum upload. */
export default function FileDrop({ kind = 'image', multiple, onFiles, onError, label, disabled }) {
  const input = useRef(null)
  const [drag, setDrag] = useState(false)
  const rule = FILE_RULES[kind]

  const handle = (list) => {
    const files = [...list]
    const ok = []
    for (const f of files) {
      const err = validateFile(f, kind)
      if (err) onError?.(`${f.name}: ${err}`)
      else ok.push(f)
    }
    if (ok.length) onFiles(multiple ? ok : [ok[0]])
  }

  return (
    <div
      className={`dropzone ${drag ? 'is-drag' : ''}`}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDrag(false)
        if (!disabled) handle(e.dataTransfer.files)
      }}
    >
      <UploadCloud aria-hidden="true" />
      <strong>{label || 'Klik atau seret file ke sini'}</strong>
      <span className="text-xs text-muted">{rule.label}</span>
      <input ref={input} type="file" hidden accept={rule.types.join(',')} multiple={multiple} onChange={(e) => { handle(e.target.files); e.target.value = '' }} />
    </div>
  )
}
