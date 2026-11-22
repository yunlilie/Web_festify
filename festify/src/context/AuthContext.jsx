/**
 * AuthContext.
 * Tahap 2 (sekarang): sesi pratinjau supaya semua halaman per role bisa direview.
 * Tahap 4: seluruh fungsi diganti Supabase Auth (signInWithPassword, signUp, signInWithOAuth,
 * resetPasswordForEmail, updateUser, onAuthStateChange). Role SELALU dibaca dari tabel profiles,
 * tidak pernah dari input pengguna.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { db, delay, uid, nowIso, ServiceError } from '@/services/preview/db'
import { isEmail, passwordIssues } from '@/utils/validators'

const AuthContext = createContext(null)
const KEY = 'festify_preview_session'

const readSession = () => {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(readSession)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 150)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    try {
      if (userId) sessionStorage.setItem(KEY, userId)
      else sessionStorage.removeItem(KEY)
    } catch { /* abaikan */ }
  }, [userId])

  const profile = useMemo(() => (userId ? db.profiles.find((p) => p.id === userId) || null : null), [userId, version])

  const refreshProfile = useCallback(() => setVersion((v) => v + 1), [])

  const signIn = useCallback(async ({ email, password }) => {
    await delay(400)
    const p = db.profiles.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!p || !password) throw new ServiceError('Email atau password salah.')
    setUserId(p.id)
    return p
  }, [])

  const signUp = useCallback(async ({ fullName, email, password, accountType, organizationName }) => {
    await delay(500)
    if (!isEmail(email)) throw new ServiceError('Format email tidak valid.')
    if (passwordIssues(password).length) throw new ServiceError('Password belum memenuhi syarat.')
    if (db.profiles.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())) throw new ServiceError('Email sudah terdaftar. Silakan masuk.')
    // Backend hanya menerima 'user' | 'organizer'. 'admin' tidak pernah bisa dari registrasi.
    const role = accountType === 'organizer' ? 'organizer' : 'user'
    const id = uid('u')
    db.profiles.push({ id, full_name: fullName.trim(), email: email.trim(), avatar_url: null, role, created_at: nowIso() })
    if (role === 'organizer') db.organizerProfiles.push({ user_id: id, organization_name: organizationName?.trim() || fullName.trim(), bio: '', phone: '', website_url: '', instagram: '', logo_url: null })
    return { needsVerification: true, email }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    await delay(300)
    throw new ServiceError('Login Google aktif setelah integrasi Supabase (Tahap 4).', 'not_configured')
  }, [])

  const sendPasswordReset = useCallback(async (email) => {
    await delay(500)
    if (!isEmail(email)) throw new ServiceError('Format email tidak valid.')
    // Selalu sukses agar tidak membocorkan email mana yang terdaftar.
  }, [])

  const updatePassword = useCallback(async (password) => {
    await delay(400)
    if (passwordIssues(password).length) throw new ServiceError('Password belum memenuhi syarat.')
  }, [])

  const signOut = useCallback(async () => {
    await delay(150)
    setUserId(null)
  }, [])

  /** Khusus pratinjau: ganti peran untuk review UI. */
  const previewAs = useCallback((id) => setUserId(id || null), [])

  const value = useMemo(
    () => ({
      user: profile ? { id: profile.id, email: profile.email } : null,
      profile,
      role: profile?.role || 'guest',
      isAuthenticated: !!profile,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
      refreshProfile,
      previewAs,
    }),
    [profile, loading, signIn, signUp, signInWithGoogle, sendPasswordReset, updatePassword, signOut, refreshProfile, previewAs],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
