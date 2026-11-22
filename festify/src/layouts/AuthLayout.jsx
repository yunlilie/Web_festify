import { Outlet } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import PreviewBar from '@/components/layout/PreviewBar'

export default function AuthLayout() {
  return (
    <>
      <PreviewBar />
      <div className="auth">
        <section className="auth__art" aria-hidden="true">
          <Logo />
          <h2>Temukan event seru, bagikan pengalamanmu.</h2>
          <p>Satu tempat untuk konser, workshop, pameran, dan festival di Jabodetabek — dengan poster, rundown, lokasi, dan ulasan jujur dari pengunjung.</p>
          <div className="auth__roles">
            <div className="auth__role">
              <strong>User</strong>
              <p>Simpan event favorit, beri rating, dan tulis ulasan pada event.</p>
            </div>
            <div className="auth__role">
              <strong>Event Organizer</strong>
              <p>Promosikan event, kelola data dan media, pantau statistik, dan balas ulasan.</p>
            </div>
          </div>
        </section>
        <main className="auth__main">
          <div className="auth__top">
            <Logo />
            <Button variant="ghost" size="sm" to="/"><ArrowLeft /> Beranda</Button>
          </div>
          <div className="auth__form page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
