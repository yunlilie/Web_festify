import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PreviewBar from '@/components/layout/PreviewBar'

export default function PublicLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <a href="#main" className="skip-link">Lewati ke konten</a>
      <PreviewBar />
      <Navbar />
      <main id="main" className="page-enter" key={pathname}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
