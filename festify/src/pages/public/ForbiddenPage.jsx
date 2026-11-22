import { ShieldX } from 'lucide-react'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ForbiddenPage() {
  useDocumentTitle('Akses ditolak')
  return (
    <div className="container">
      <EmptyState icon={ShieldX} title="Kamu tidak punya akses ke halaman ini" description="Halaman ini khusus untuk peran tertentu. Jika kamu penyelenggara event, aktifkan akun organizer terlebih dahulu." action={<div className="row"><Button to="/">Ke beranda</Button><Button variant="secondary" to="/become-organizer">Jadi organizer</Button></div>} />
    </div>
  )
}
