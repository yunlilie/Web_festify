import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <Logo />
          <p className="footer__tag">Direktori event interaktif untuk menemukan konser, workshop, pameran, dan festival di Jabodetabek — lengkap dengan poster, rundown, dan ulasan pengunjung.</p>
        </div>
        <div>
          <h4>Jelajahi</h4>
          <ul>
            <li><Link to="/explore">Semua event</Link></li>
            <li><Link to="/explore?date=weekend">Akhir pekan ini</Link></li>
            <li><Link to="/explore?max=0">Event gratis</Link></li>
            <li><Link to="/explore?sort=popular">Terpopuler</Link></li>
          </ul>
        </div>
        <div>
          <h4>Penyelenggara</h4>
          <ul>
            <li><Link to="/register?type=organizer">Daftar sebagai organizer</Link></li>
            <li><Link to="/organizer">Dashboard organizer</Link></li>
            <li><Link to="/faq">Panduan unggah event</Link></li>
          </ul>
        </div>
        <div>
          <h4>Festify</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/syarat-ketentuan">Syarat &amp; Ketentuan</Link></li>
            <li><Link to="/kebijakan-privasi">Kebijakan Privasi</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Festify. Pembelian tiket diproses oleh platform resmi penyelenggara.</span>
        <span>Dibuat oleh Kelompok 5 — Teknik Multimedia Digital PNJ</span>
      </div>
    </footer>
  )
}
