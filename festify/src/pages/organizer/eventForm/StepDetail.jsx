import { Input, Select, Textarea } from '@/components/ui/Field'
import { slugify } from '@/utils/slugify'

export default function StepDetail({ v, set, patch, errors, categories, regions, slugTouched, setSlugTouched }) {
  const provinces = [...new Set(regions.map((r) => r.province))]
  return (
    <div className="stack">
      <Input
        label="Judul event"
        required
        maxLength={120}
        value={v.title}
        onChange={(e) => patch({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
        error={errors.title}
        placeholder="Contoh: Jakarta Indie Fest 2026"
      />
      <Input
        label="Slug URL"
        required
        value={v.slug}
        onChange={(e) => {
          setSlugTouched(true)
          set('slug')({ target: { value: slugify(e.target.value) } })
        }}
        error={errors.slug}
        hint={`festify.id/events/${v.slug || 'slug-event'}`}
      />
      <Textarea label="Deskripsi" required rows={7} maxLength={5000} value={v.description} onChange={set('description')} error={errors.description} hint={`${v.description.length}/5000 · minimal 50 karakter`} />
      <div className="form-grid form-grid--2">
        <Select label="Kategori" required value={v.category_id || ''} onChange={(e) => patch({ category_id: Number(e.target.value) || null })} error={errors.category_id}>
          <option value="">Pilih kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Wilayah" required value={v.region_id || ''} onChange={(e) => patch({ region_id: Number(e.target.value) || null })} error={errors.region_id}>
          <option value="">Pilih wilayah</option>
          {provinces.map((p) => (
            <optgroup key={p} label={p}>
              {regions.filter((r) => r.province === p).map((r) => <option key={r.id} value={r.id}>{[r.district, r.city].filter(Boolean).join(', ')}</option>)}
            </optgroup>
          ))}
        </Select>
      </div>
    </div>
  )
}
