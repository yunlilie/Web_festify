import { useEffect, useRef, useState } from 'react'
import { MapPin, Info } from 'lucide-react'
import { loadGoogleMaps, mapsKey } from '@/lib/googleMaps'

/**
 * Pencarian lokasi dengan Google Places Autocomplete (REQ-4.7.2).
 * onSelect({ venue_name, address, latitude, longitude })
 */
export default function PlaceSearch({ onSelect }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState(mapsKey ? 'loading' : 'no-key')

  useEffect(() => {
    if (!mapsKey) return
    let ac
    loadGoogleMaps()
      .then((google) => {
        ac = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'id' },
          fields: ['name', 'formatted_address', 'geometry'],
        })
        ac.addListener('place_changed', () => {
          const p = ac.getPlace()
          if (!p.geometry) return
          onSelect({
            venue_name: p.name,
            address: p.formatted_address,
            latitude: Number(p.geometry.location.lat().toFixed(7)),
            longitude: Number(p.geometry.location.lng().toFixed(7)),
          })
        })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
    return () => ac && window.google?.maps?.event?.clearInstanceListeners(ac)
  }, [onSelect])

  return (
    <div className="field">
      <label className="field__label" htmlFor="place-search">Cari lokasi di Google Maps</label>
      <div className="input-icon">
        <MapPin aria-hidden="true" />
        <input id="place-search" ref={inputRef} className="input" placeholder={status === 'ready' ? 'Ketik nama venue atau alamat…' : 'Pencarian lokasi belum aktif'} disabled={status !== 'ready'} />
      </div>
      {status !== 'ready' && (
        <span className="field__hint row" style={{ gap: 6 }}>
          <Info size={13} />
          {status === 'no-key' && 'Isi VITE_GOOGLE_MAPS_API_KEY untuk mengaktifkan autocomplete. Sementara, isi koordinat secara manual di bawah.'}
          {status === 'loading' && 'Memuat Google Maps…'}
          {status === 'error' && 'Google Maps gagal dimuat. Isi koordinat secara manual.'}
        </span>
      )}
    </div>
  )
}
