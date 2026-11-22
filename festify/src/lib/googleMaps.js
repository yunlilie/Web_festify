/** Loader Google Maps JavaScript API (library `places`). Key dibatasi per domain di Google Cloud. */
let promise = null

export const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function loadGoogleMaps() {
  if (!mapsKey) return Promise.reject(new Error('Google Maps API key belum diatur.'))
  if (window.google?.maps?.places) return Promise.resolve(window.google)
  if (promise) return promise
  promise = new Promise((resolve, reject) => {
    const cb = `__festifyMaps${Date.now()}`
    window[cb] = () => {
      resolve(window.google)
      delete window[cb]
    }
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsKey)}&libraries=places&language=id&region=ID&callback=${cb}`
    s.async = true
    s.onerror = () => {
      promise = null
      reject(new Error('Gagal memuat Google Maps.'))
    }
    document.head.appendChild(s)
  })
  return promise
}
