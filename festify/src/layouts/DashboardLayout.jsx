import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, ExternalLink } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import PreviewBar from '@/components/layout/PreviewBar'
import { useAuth } from '@/context/AuthContext'

/** Layout bersama untuk dashboard organizer & admin. `nav`: [{ group?, to, label, icon, end? }] */
export default function DashboardLayout({ nav, roleLabel, home }) {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  const logout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <>
      <PreviewBar />
      <div className="dash">
        <aside className={`side ${open ? 'is-open' : ''}`} aria-label={`Navigasi ${roleLabel}`}>
          <div className="side__head">
            <Logo to={home} />
            <div><span className="side__role">{roleLabel}</span></div>
          </div>
          <nav className="side__nav">
            {nav.map((n) =>
              n.group ? (
                <span key={n.group} className="side__group">{n.group}</span>
              ) : (
                <NavLink key={n.to} to={n.to} end={n.end} className="side__link">
                  <n.icon aria-hidden="true" /> {n.label}
                </NavLink>
              ),
            )}
          </nav>
          <div className="side__foot">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
            <div className="grow">
              <strong>{profile?.full_name}</strong>
              <span>{profile?.email}</span>
            </div>
            <button type="button" onClick={logout} aria-label="Keluar" title="Keluar"><LogOut /></button>
          </div>
        </aside>
        {open && <div className="side-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
        <div className="dash__main">
          <header className="dash__top">
            <button type="button" className="nav__icon-btn nav__burger" onClick={() => setOpen(true)} aria-label="Buka navigasi"><Menu /></button>
            <span className="grow" />
            <Button variant="secondary" size="sm" to="/"><ExternalLink /> Lihat situs</Button>
            <Link to="/profile" aria-label="Profil"><Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" /></Link>
          </header>
          <main className="dash__content page-enter" key={pathname}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
