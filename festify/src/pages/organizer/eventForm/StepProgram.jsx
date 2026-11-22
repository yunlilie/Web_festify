import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { toLocalInput, fromLocalInput } from '@/utils/datetime'

const move = (arr, i, d) => {
  const j = i + d
  if (j < 0 || j >= arr.length) return arr
  const next = [...arr]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export default function StepProgram({ v, patch, errors }) {
  const sched = v.schedules
  const perf = v.performers
  const setS = (i, k, val) => patch({ schedules: sched.map((s, idx) => (idx === i ? { ...s, [k]: val } : s)) })
  const setP = (i, k, val) => patch({ performers: perf.map((p, idx) => (idx === i ? { ...p, [k]: val } : p)) })

  return (
    <div className="stack-lg">
      <section className="stack">
        <div className="row-between">
          <div>
            <strong>Pengisi acara <span style={{ color: 'var(--accent)' }}>*</span></strong>
            <p className="text-xs text-muted">Guest star, band, pembicara, atau mentor.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => patch({ performers: [...perf, { name: '', role: '' }] })}><Plus /> Tambah pengisi</Button>
        </div>
        {errors.performers && <span className="field__error">{errors.performers}</span>}
        {perf.map((p, i) => (
          <div key={p.id || `p${i}`} className="repeat-item">
            <div className="repeat-item__bar">
              <strong>Pengisi #{i + 1}</strong>
              <div className="row" style={{ gap: 4 }}>
                <Button variant="ghost" size="sm" icon onClick={() => patch({ performers: move(perf, i, -1) })} disabled={!i} aria-label="Naikkan"><ArrowUp /></Button>
                <Button variant="ghost" size="sm" icon onClick={() => patch({ performers: move(perf, i, 1) })} disabled={i === perf.length - 1} aria-label="Turunkan"><ArrowDown /></Button>
                <Button variant="ghost" size="sm" icon onClick={() => patch({ performers: perf.filter((_, x) => x !== i) })} aria-label="Hapus pengisi"><Trash2 /></Button>
              </div>
            </div>
            <div className="form-grid form-grid--2">
              <Input label="Nama" required value={p.name} onChange={(e) => setP(i, 'name', e.target.value)} error={errors[`performers.${i}.name`]} maxLength={100} />
              <Input label="Peran" placeholder="Headliner, Pembicara, MC…" value={p.role || ''} onChange={(e) => setP(i, 'role', e.target.value)} maxLength={60} />
            </div>
          </div>
        ))}
      </section>

      <section className="stack">
        <div className="row-between">
          <div>
            <strong>Rundown <span style={{ color: 'var(--accent)' }}>*</span></strong>
            <p className="text-xs text-muted">Atur urutan dengan tombol panah. Waktu dalam WIB.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => patch({ schedules: [...sched, { title: '', description: '', start_time: v.start_date, end_time: v.start_date, speaker: '', location: '' }] })}><Plus /> Tambah rundown</Button>
        </div>
        {errors.schedules && <span className="field__error">{errors.schedules}</span>}
        {sched.map((s, i) => (
          <div key={s.id || `s${i}`} className="repeat-item">
            <div className="repeat-item__bar">
              <strong>Sesi #{i + 1}</strong>
              <div className="row" style={{ gap: 4 }}>
                <Button variant="ghost" size="sm" icon onClick={() => patch({ schedules: move(sched, i, -1) })} disabled={!i} aria-label="Naikkan"><ArrowUp /></Button>
                <Button variant="ghost" size="sm" icon onClick={() => patch({ schedules: move(sched, i, 1) })} disabled={i === sched.length - 1} aria-label="Turunkan"><ArrowDown /></Button>
                <Button variant="ghost" size="sm" icon onClick={() => patch({ schedules: sched.filter((_, x) => x !== i) })} aria-label="Hapus rundown"><Trash2 /></Button>
              </div>
            </div>
            <Input label="Nama kegiatan" required value={s.title} onChange={(e) => setS(i, 'title', e.target.value)} error={errors[`schedules.${i}.title`]} maxLength={120} />
            <div className="form-grid form-grid--2">
              <Input label="Mulai" type="datetime-local" required value={toLocalInput(s.start_time)} onChange={(e) => setS(i, 'start_time', fromLocalInput(e.target.value))} error={errors[`schedules.${i}.start_time`]} />
              <Input label="Selesai" type="datetime-local" required value={toLocalInput(s.end_time)} min={toLocalInput(s.start_time)} onChange={(e) => setS(i, 'end_time', fromLocalInput(e.target.value))} error={errors[`schedules.${i}.end_time`]} />
            </div>
            <div className="form-grid form-grid--2">
              <Input label="Speaker / pengisi" value={s.speaker || ''} onChange={(e) => setS(i, 'speaker', e.target.value)} maxLength={100} />
              <Input label="Lokasi kegiatan" placeholder="Panggung utama, Ruang A…" value={s.location || ''} onChange={(e) => setS(i, 'location', e.target.value)} maxLength={100} />
            </div>
            <Textarea label="Deskripsi" rows={2} value={s.description || ''} onChange={(e) => setS(i, 'description', e.target.value)} maxLength={500} />
          </div>
        ))}
      </section>
    </div>
  )
}
