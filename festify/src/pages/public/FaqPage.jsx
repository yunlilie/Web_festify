import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const FAQ = [
  ['Apakah saya bisa membeli tiket di Festify?', 'Tidak. Festify adalah direktori informasi event. Tombol “Beli tiket / Daftar” akan membuka platform resmi milik penyelenggara di tab baru, dan seluruh transaksi diproses di sana.'],
  ['Apakah saya harus login untuk melihat event?', 'Tidak perlu. Semua event bisa dilihat tanpa akun. Login hanya diperlukan untuk menyimpan favorit, memberi rating, dan menulis ulasan.'],
  ['Kenapa ulasan saya ditolak?', 'Ulasan diperiksa otomatis terhadap daftar kata yang tidak diperbolehkan (kata kasar, SARA, spam). Gunakan bahasa yang sopan lalu kirim ulang.'],
  ['Bagaimana cara menjadi organizer?', 'Pilih “Event Organizer” saat mendaftar, atau buka menu akun → “Jadi organizer” jika sudah punya akun User. Dashboard organizer akan langsung aktif.'],
  ['Data apa yang wajib diisi sebelum event diterbitkan?', 'Judul, deskripsi, kategori, wilayah, tanggal & waktu, venue dan titik lokasi, minimal satu pengisi acara, minimal satu rundown, poster utama, serta link tiket resmi (https).'],
  ['Berapa ukuran file maksimal untuk poster dan video?', 'Gambar JPG/PNG/WebP maksimal 5 MB. Video MP4/WebM maksimal 50 MB, atau gunakan tautan YouTube.'],
  ['Apa yang terjadi pada event yang sudah lewat?', 'Event yang selesai otomatis berstatus “Selesai” dan keluar dari katalog, tetapi halaman detail dan ulasannya tetap bisa dibuka lewat tautan. Organizer dapat mengarsipkannya.'],
]

export default function FaqPage() {
  useDocumentTitle('Bantuan & FAQ')
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <header className="page-title">
        <h1>Bantuan &amp; FAQ</h1>
        <p>Jawaban untuk pertanyaan yang paling sering diajukan.</p>
      </header>
      <div className="stack">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card" style={{ padding: 'var(--sp-5)' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{q}</summary>
            <p className="text-muted" style={{ marginTop: 'var(--sp-3)' }}>{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
