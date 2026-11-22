import CrudTable from './CrudTable'
import { Input, Textarea } from '@/components/ui/Field'
import CategoryIcon, { categoryColor } from '@/components/event/CategoryIcon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listCategories, saveCategory, deleteCategory } from '@/services/catalogService'
import { slugify } from '@/utils/slugify'

const Form = ({ value, onChange }) => (
  <>
    <Input label="Nama kategori" required value={value.name || ''} onChange={(e) => onChange({ name: e.target.value, ...(!value.id ? { slug: slugify(e.target.value) } : {}) })} maxLength={50} />
    <Input label="Slug" value={value.slug || ''} onChange={(e) => onChange({ slug: slugify(e.target.value) })} hint="Dipakai di URL filter, contoh /explore?category=musik" />
    <Textarea label="Deskripsi" rows={3} value={value.description || ''} onChange={(e) => onChange({ description: e.target.value })} maxLength={200} />
  </>
)

export default function CategoriesPage() {
  useDocumentTitle('Kategori')
  return (
    <CrudTable
      title="Kategori event"
      description="Kategori dipakai untuk filter katalog (REQ-BR-0.7)."
      noun="Kategori"
      load={listCategories}
      save={saveCategory}
      remove={deleteCategory}
      empty={{ name: '', slug: '', description: '' }}
      Form={Form}
      columns={[
        { key: 'name', label: 'Kategori', render: (c) => <span className="row" style={{ flexWrap: 'nowrap' }}><span className="cat-tile__icon" style={{ background: categoryColor(c), width: 32, height: 32, borderRadius: 10 }}><CategoryIcon slug={c.slug} size={16} /></span><strong>{c.name}</strong></span> },
        { key: 'slug', label: 'Slug', render: (c) => <code className="text-xs">{c.slug}</code> },
        { key: 'description', label: 'Deskripsi' },
      ]}
    />
  )
}
