import { Compass } from 'lucide-react'
import Button from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Halaman tidak ditemukan')
  return (
    <div className="container">
      <EmptyState icon={Compass} title="Halaman tidak ditemukan" description="Tautan yang kamu buka mungkin salah atau halaman sudah dipindahkan." action={<Button to="/">Kembali ke beranda</Button>} />
    </div>
  )
}
