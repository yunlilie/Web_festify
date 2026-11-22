import CrudTable from './CrudTable'
import { Input, Select } from '@/components/ui/Field'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listRegions, saveRegion, deleteRegion } from '@/services/catalogService'

const PROVINCES = ['DKI Jakarta', 'Jawa Barat', 'Banten']

const Form = ({ value, onChange }) => (
  <>
    <Select label="Provinsi" required value={value.province || ''} onChange={(e) => onChange({ province: e.target.value })}>
      <option value="">Pilih provinsi</option>
      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
    </Select>
    <Input label="Kota / kabupaten" required value={value.city || ''} onChange={(e) => onChange({ city: e.target.value })} maxLength={80} />
    <Input label="Kecamatan" value={value.district || ''} onChange={(e) => onChange({ district: e.target.value })} hint="Opsional" maxLength={80} />
  </>
)

export default function RegionsPage() {
  useDocumentTitle('Wilayah')
  return (
    <CrudTable
      title="Wilayah"
      description="Cakupan Jabodetabek. Kecamatan boleh dikosongkan."
      noun="Wilayah"
      load={listRegions}
      save={saveRegion}
      remove={deleteRegion}
      empty={{ province: 'DKI Jakarta', city: '', district: '' }}
      Form={Form}
      columns={[
        { key: 'province', label: 'Provinsi' },
        { key: 'city', label: 'Kota / kabupaten', render: (r) => <strong>{r.city}</strong> },
        { key: 'district', label: 'Kecamatan' },
        { key: 'slug', label: 'Slug', render: (r) => <code className="text-xs">{r.slug}</code> },
      ]}
    />
  )
}
