import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Heart, Menu, Search, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import UserMenu from './UserMenu'
import { useAuth } from '@/context/AuthContext'
import { countUnread } from '@/services/notificationService'

const LINKS = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/explore', label: 'Jelajahi Event' },
  { to: '/faq', label: 'Bantuan' },
]

export default function Navbar() {
  const { profile, isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [q, setQ] = useState('')
  const [unread, setUnread] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setDrawer(false) }, [location.pathname])

  useEffect(() => {
    if (!profile) { setUnread(0); return }
    countUnread(profile.id).then(setUnread).catch(() => {})
  }, [profile, location.pathname])

  const search = (e) => {
    e.preventDefault()
    navigate(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore')
  }

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container nav__inner">
        <Logo />
        <nav className="nav__links" aria-label="Navigasi utama">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav__link">{l.label}</NavLink>
          ))}
        </nav>
        <form className="nav__search" role="search" onSubmit={search}>
          <div className="input-icon">
            <Search aria-hidden="true" />
            <input className="input" type="search" placeholder="Cari konser, workshop, pameran…" aria-label="Cari event" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </form>
        <div className="nav__actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/favorites" className="nav__icon-btn" aria-label="Event favorit"><Heart /></NavLink>
              <NavLink to="/notifications" className="nav__icon-btn" aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`}>
                <Bell />
                {unread > 0 && <span className="nav__dot">{unread > 9 ? '9+' : unread}</span>}
              </NavLink>
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/login" state={{ from: location.pathname + location.search }}>Masuk</Button>
              <Button size="sm" to="/register">Daftar</Button>
            </>
          )}
          <button type="button" className="nav__icon-btn nav__burger" aria-label={drawer ? 'Tutup menu' : 'Buka menu'} aria-expanded={drawer} onClick={() => setDrawer((d) => !d)}>
            {drawer ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {drawer && (
        <div className="nav__drawer">
          <div className="container stack">
            <form role="search" onSubmit={search}>
              <div className="input-icon">
                <Search aria-hidden="true" />
                <input className="input" type="search" placeholder="Cari event…" aria-label="Cari event" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </form>
            <nav aria-label="Navigasi seluler">
              {LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className="nav__link">{l.label}</NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
