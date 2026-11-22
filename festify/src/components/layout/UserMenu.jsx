import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, LogOut, ShieldCheck, User, Bell, Megaphone } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { RoleBadge } from '../ui/Badge'
import { useAuth } from '@/context/AuthContext'

export default function UserMenu() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [])

  const logout = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  const item = (to, Icon, label) => (
    <Link className="menu__item" to={to} role="menuitem" onClick={() => setOpen(false)}>
      <Icon aria-hidden="true" /> {label}
    </Link>
  )

  return (
    <div className="nav__user" ref={ref}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label="Menu akun" onClick={() => setOpen((o) => !o)}>
        <Avatar src={profile.avatar_url} name={profile.full_name} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu__head">
            <strong className="text-sm" style={{ display: 'block' }}>{profile.full_name}</strong>
            <span className="text-xs text-muted" style={{ display: 'block', marginBottom: 6 }}>{profile.email}</span>
            <RoleBadge role={profile.role} />
          </div>
          {profile.role === 'organizer' && item('/organizer', LayoutDashboard, 'Dashboard organizer')}
          {profile.role === 'admin' && item('/admin', ShieldCheck, 'Panel admin')}
          {item('/profile', User, 'Profil saya')}
          {item('/favorites', Heart, 'Event favorit')}
          {item('/notifications', Bell, 'Notifikasi')}
          {profile.role === 'user' && item('/become-organizer', Megaphone, 'Jadi organizer')}
          <button type="button" className="menu__item" role="menuitem" onClick={logout}>
            <LogOut aria-hidden="true" /> Keluar
          </button>
        </div>
      )}
    </div>
  )
}
