import { EventsTable } from '@/pages/organizer/EventsPage'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminEventsPage() {
  useDocumentTitle('Manajemen event')
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Semua event</h1>
          <p>Admin dapat menerbitkan, membatalkan, mengarsipkan, atau menghapus permanen event dari organizer mana pun.</p>
        </div>
      </div>
      <EventsTable ownerId={null} asAdmin />
    </>
  )
}
