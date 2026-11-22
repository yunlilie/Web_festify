import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const CONTENT = {
  terms: {
    title: 'Syarat & Ketentuan',
    sections: [
      ['Layanan', 'Festify menyediakan direktori informasi event. Festify tidak menjual, memproses, atau menjamin tiket. Pembelian dan pendaftaran dilakukan di platform resmi penyelenggara melalui tautan eksternal.'],
      ['Akun', 'Pengguna wajib memberikan data yang benar dan menjaga kerahasiaan password. Satu akun digunakan oleh satu orang.'],
      ['Ulasan & komentar', 'Ulasan wajib menggunakan bahasa yang sopan. Dilarang memuat ujaran kebencian, SARA, pencemaran nama baik, kata kasar, atau spam. Festify dan penyelenggara berhak menyembunyikan atau menghapus ulasan yang melanggar tanpa pemberitahuan.'],
      ['Penyelenggara', 'Penyelenggara wajib melengkapi informasi event secara akurat, memastikan tautan tiket aman dan valid, serta hanya mengunggah media yang tidak melanggar hukum atau hak cipta.'],
      ['Pengarsipan', 'Event yang telah berakhir dapat diarsipkan. Ulasan yang terkait tetap tersimpan sebagai data historis namun tidak lagi tampil di katalog.'],
    ],
  },
  privacy: {
    title: 'Kebijakan Privasi',
    sections: [
      ['Data yang dikumpulkan', 'Nama, email, foto profil (opsional), event favorit, ulasan, serta data statistik anonim seperti jumlah tampilan dan klik tautan tiket.'],
      ['Penggunaan data', 'Data digunakan untuk menjalankan fitur akun, favorit, ulasan, notifikasi, rekomendasi event, dan statistik agregat bagi penyelenggara. Penyelenggara tidak menerima email pribadi pengunjung.'],
      ['Pembayaran', 'Festify tidak menyimpan data pembayaran apa pun karena transaksi dilakukan di platform pihak ketiga.'],
      ['Keamanan', 'Password disimpan dalam bentuk hash oleh layanan autentikasi. Akses data dibatasi dengan Row Level Security dan seluruh komunikasi menggunakan HTTPS.'],
      ['Hak pengguna', 'Pengguna dapat mengubah profil kapan saja dan meminta penghapusan akun melalui admin.'],
    ],
  },
}

export default function LegalPage({ kind }) {
  const c = CONTENT[kind]
  useDocumentTitle(c.title)
  return (
    <div className="container" style={{ maxWidth: 820 }}>
      <header className="page-title">
        <h1>{c.title}</h1>
        <p>Berlaku sejak peluncuran Festify versi 2.0.</p>
      </header>
      <div className="card stack-lg">
        {c.sections.map(([h, t], i) => (
          <section key={h}>
            <h2 style={{ fontSize: 'var(--fs-lg)' }}>{i + 1}. {h}</h2>
            <p className="text-muted" style={{ marginTop: 8 }}>{t}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
