import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import { listFavoriteIds, toggleFavorite } from '@/services/favoriteService'
import { friendlyError } from '@/utils/errors'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [ids, setIds] = useState(new Set())
  const [pending, setPending] = useState(new Set())

  useEffect(() => {
    let alive = true
    if (!user) {
      setIds(new Set())
      return
    }
    listFavoriteIds(user.id).then((s) => alive && setIds(s)).catch(() => {})
    return () => {
      alive = false
    }
  }, [user])

  const toggle = useCallback(
    async (eventId) => {
      if (!user) {
        toast.info('Masuk dulu untuk menyimpan event favorit.')
        navigate('/login', { state: { from: location.pathname + location.search } })
        return
      }
      if (pending.has(eventId)) return
      setPending((p) => new Set(p).add(eventId))
      const was = ids.has(eventId)
      setIds((s) => {
        const n = new Set(s)
        was ? n.delete(eventId) : n.add(eventId)
        return n
      })
      try {
        const now = await toggleFavorite(user.id, eventId)
        toast.success(now ? 'Event disimpan ke favorit.' : 'Event dihapus dari favorit.')
      } catch (e) {
        setIds((s) => {
          const n = new Set(s)
          was ? n.add(eventId) : n.delete(eventId)
          return n
        })
        toast.error(friendlyError(e))
      } finally {
        setPending((p) => {
          const n = new Set(p)
          n.delete(eventId)
          return n
        })
      }
    },
    [user, ids, pending, toast, navigate, location],
  )

  const value = useMemo(() => ({ isFavorite: (id) => ids.has(id), toggle, count: ids.size }), [ids, toggle])
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => useContext(FavoritesContext)
