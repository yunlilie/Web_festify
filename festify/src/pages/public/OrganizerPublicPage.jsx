import { useParams } from 'react-router-dom'
import { Globe, AtSign, CalendarX } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import EventCard from '@/components/event/EventCard'
import { Spinner, EmptyState, ErrorState } from '@/components/ui/States'
import { useAsync } from '@/hooks/useAsync'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getOrganizerProfile } from '@/services/profileService'
import { listEventsByOrganizer } from '@/services/eventService'

export default function OrganizerPublicPage() {
  const { id } = useParams()
  const org = useAsync(() => getOrganizerProfile(id), [id])
  const events = useAsync(() => listEventsByOrganizer(id), [id])
  useDocumentTitle(org.data?.organization_name || 'Organizer')

  if (org.loading) return <Spinner />
  if (org.error) return <div className="container"><ErrorState message={org.error} onRetry={org.reload} /></div>
  if (!org.data) return <div className="container"><EmptyState title="Organizer tidak ditemukan" /></div>
  const o = org.data
  return (
    <div className="container">
      <header className="page-title row" style={{ gap: 'var(--sp-6)', alignItems: 'center' }}>
        <Avatar src={o.logo_url} name={o.organization_name} size="lg" />
        <div className="grow">
          <h1>{o.organization_name}</h1>
          {o.bio && <p>{o.bio}</p>}
          <div className="row text-sm" style={{ marginTop: 8 }}>
            {o.website_url && <a className="link row" style={{ gap: 4 }} href={o.website_url} target="_blank" rel="noopener noreferrer"><Globe size={14} /> Situs web</a>}
            {o.instagram && <span className="row text-muted" style={{ gap: 4 }}><AtSign size={14} /> {o.instagram.replace('@', '')}</span>}
          </div>
        </div>
      </header>
      <h2 style={{ fontSize: 'var(--fs-2xl)', marginBottom: 'var(--sp-5)' }}>Event mendatang</h2>
      {events.loading ? <Spinner /> : !events.data?.length ? (
        <EmptyState icon={CalendarX} title="Belum ada event aktif" description="Organizer ini belum menerbitkan event baru." />
      ) : (
        <div className="event-grid">{events.data.map((e) => <EventCard key={e.id} event={e} />)}</div>
      )}
    </div>
  )
}
