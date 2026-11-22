import { HeartOff } from 'lucide-react'
import EventCard from '@/components/event/EventCard'
import Button from '@/components/ui/Button'
import { EventGridSkeleton, ErrorState, EmptyState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/context/AuthContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { listFavorites } from '@/services/favoriteService'

export default function FavoritesPage() {
  useDocumentTitle('Event favorit')
  const { user } = useAuth()
  const fav = useFavorites()
  const list = useAsync(() => listFavorites(user.id), [user.id])
  // Kartu yang di-unfavorite langsung hilang dari daftar.
  const items = (list.data || []).filter((e) => fav.isFavorite(e.id))

  return (
    <div className="container">
      <header className="page-title">
        <h1>Event favorit</h1>
        <p>Event yang kamu simpan. Kami akan memberi notifikasi jika jadwalnya berubah.</p>
      </header>
      {list.loading ? (
        <EventGridSkeleton count={4} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : !items.length ? (
        <EmptyState icon={HeartOff} title="Belum ada event favorit" description="Tekan ikon hati pada event yang kamu minati agar mudah ditemukan lagi." action={<Button to="/explore">Jelajahi event</Button>} />
      ) : (
        <div className="event-grid">{items.map((e) => <EventCard key={e.id} event={e} />)}</div>
      )}
    </div>
  )
}
