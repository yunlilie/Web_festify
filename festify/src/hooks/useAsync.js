import { useCallback, useEffect, useRef, useState } from 'react'
import { friendlyError } from '@/utils/errors'

/** Menjalankan fungsi async dan mengelola state loading/error/data. */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: undefined, loading: immediate, error: null })
  const alive = useRef(true)
  const callId = useRef(0)

  const run = useCallback(async () => {
    const id = ++callId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await fn()
      if (alive.current && id === callId.current) setState({ data, loading: false, error: null })
      return data
    } catch (e) {
      if (alive.current && id === callId.current) setState((s) => ({ ...s, loading: false, error: friendlyError(e) }))
      return undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    alive.current = true
    if (immediate) run()
    return () => {
      alive.current = false
    }
  }, [run, immediate])

  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), [])

  return { ...state, reload: run, setData }
}
