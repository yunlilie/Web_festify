const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

let payload = null;

try {
  payload = JSON.parse(
    atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
  );
} catch {
  // Payload tidak berhasil dibaca.
}

export const diagnostics = {
  url: import.meta.env.VITE_SUPABASE_URL,
  keyExists: Boolean(key),
  keyLength: key?.length ?? 0,
  keyParts: key?.split('.').length ?? 0,
  projectRef: payload?.ref ?? 'Tidak ditemukan',
  role: payload?.role ?? 'Tidak ditemukan',
};
