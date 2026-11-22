// Upload media. Tahap 4: supabase.storage.from('avatars' | 'event-media').upload(path, file)
// dengan path `${userId}/...` atau `${userId}/${eventId}/...` sesuai Storage policies.
import { delay } from './preview/db'
import { validateFile } from '@/utils/validators'

export async function uploadFile(file, { kind = 'image' } = {}) {
  const err = validateFile(file, kind)
  if (err) throw new Error(err)
  await delay(500)
  // Mode pratinjau: URL lokal sementara (hilang saat halaman di-refresh).
  return { url: URL.createObjectURL(file), path: `preview/${file.name}` }
}

export async function removeFile() {
  await delay(150)
}
