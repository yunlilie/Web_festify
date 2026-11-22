import { Link } from 'react-router-dom'
import { Heart, MapPin, Star } from 'lucide-react'
import Poster from '../ui/Poster'
import { Badge } from '../ui/Badge'
import { useFavorites } from '@/context/FavoritesContext'
import { dayMonth, formatPriceFrom } from '@/utils/format'

export default function EventCard({ event, eager }) {
  const fav = useFavorites()
  const active = fav.isFavorite(event.id)
  const { day, month } = dayMonth(event.start_date)
  const rating = event.statistics?.average_rating
  return (
    <article className="event-card">
      <div className="event-card__media">
        <div className="event-card__top">
          {event.category && <Badge tone="glass">{event.category.name}</Badge>}
          <button
            type="button"
            className={`event-card__fav ${active ? 'is-active' : ''}`}
            onClick={() => fav.toggle(event.id)}
            aria-pressed={active}
            aria-label={active ? `Hapus ${event.title} dari favorit` : `Simpan ${event.title} ke favorit`}
          >
            <Heart fill={active ? 'currentColor' : 'none'} />
          </button>
        </div>
        <Poster src={event.poster_url} title={event.title} meta={event.region?.city} eager={eager} />
        <div className="event-card__date" aria-hidden="true">
          <b>{day}</b>
          <span>{month}</span>
        </div>
      </div>
      <div className="event-card__body">
        <h3 className="event-card__title">
          <Link to={`/events/${event.slug}`}>{event.title}</Link>
        </h3>
        <span className="event-card__meta">
          <MapPin aria-hidden="true" /> {event.venue_name} · {event.region?.city}
        </span>
        <div className="event-card__foot">
          <span className="event-card__price">{formatPriceFrom(event.ticket_price_min, event.ticket_price_max)}</span>
          {rating > 0 && (
            <span className="event-card__rating" aria-label={`Rating ${rating}`}>
              <Star aria-hidden="true" /> {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
