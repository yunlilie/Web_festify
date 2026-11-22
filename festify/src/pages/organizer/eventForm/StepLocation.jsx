import { useCallback } from 'react'
import { Input, Textarea } from '@/components/ui/Field'
import PlaceSearch from '@/components/event/PlaceSearch'
import { toLocalInput, fromLocalInput } from '@/utils/datetime'
import { mapsEmbedUrl } from '@/utils/format'

export default function StepLocation({ v, patch, set, errors }) {
  const onPlace = useCallback((p) => patch(p), [patch])
  const hasCoord = v.latitude !== '' && v.latitude != null && v.longitude !== '' && v.longitude != null
  return (
    <div className="stack">
      <div className="form-grid form-grid--2">
        <Input label="Mulai" type="datetime-local" required value={toLocalInput(v.start_date)} onChange={(e) => patch({ start_date: fromLocalInput(e.target.value) })} error={errors.start_date} hint="Waktu Indonesia Barat (WIB)" />
        <Input label="Selesai" type="datetime-local" required value={toLocalInput(v.end_date)} min={toLocalInput(v.start_date)} onChange={(e) => patch({ end_date: fromLocalInput(e.target.value) })} error={errors.end_date} />
      </div>
      <PlaceSearch onSelect={onPlace} />
      <Input label="Nama venue" required value={v.venue_name} onChange={set('venue_name')} error={errors.venue_name} maxLength={150} />
      <Textarea label="Alamat lengkap" required rows={3} value={v.address} onChange={set('address')} error={errors.address} maxLength={300} />
      <div className="form-grid form-grid--2">
        <Input label="Latitude" type="number" step="any" min="-90" max="90" value={v.latitude ?? ''} onChange={(e) => patch({ latitude: e.target.value === '' ? null : Number(e.target.value) })} error={errors.latitude} hint="Terisi otomatis dari pencarian" />
        <Input label="Longitude" type="number" step="any" min="-180" max="180" value={v.longitude ?? ''} onChange={(e) => patch({ longitude: e.target.value === '' ? null : Number(e.target.value) })} error={errors.longitude} />
      </div>
      {hasCoord && (
        <div className="map-frame">
          <iframe title="Pratinjau lokasi" src={mapsEmbedUrl(v.latitude, v.longitude, v.venue_name, import.meta.env.VITE_GOOGLE_MAPS_API_KEY)} loading="lazy" />
        </div>
      )}
    </div>
  )
}
