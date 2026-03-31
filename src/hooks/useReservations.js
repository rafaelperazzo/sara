import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Busca todas as reservas de um determinado mês e retorna um Map
 * indexado por string de data "YYYY-MM-DD".
 */
export function useReservations(year, month) {
  const [reservationsMap, setReservationsMap] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const mm = String(month + 1).padStart(2, '0')
    const lastDay = new Date(year, month + 1, 0).getDate()
    const from = `${year}-${mm}-01`
    const to = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`

    supabase
      .from('auditorio')
      .select('*')
      .gte('data', from)
      .lte('data', to)
      .order('data', { ascending: true })
      .order('inicio', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error)
          setLoading(false)
          return
        }

        const map = new Map()
        for (const row of data) {
          const key = row.data // "YYYY-MM-DD"
          if (!map.has(key)) map.set(key, [])
          map.get(key).push(row)
        }
        setReservationsMap(map)
        setLoading(false)
      })
  }, [year, month])

  return { reservationsMap, loading, error, reload: () => {} }
}

/**
 * Versão com callback de reload explícito.
 */
export function useReservationsWithReload(year, month) {
  const [reservationsMap, setReservationsMap] = useState(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  const reload = () => setTick(t => t + 1)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const mm = String(month + 1).padStart(2, '0')
    const lastDay = new Date(year, month + 1, 0).getDate()
    const from = `${year}-${mm}-01`
    const to = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`

    supabase
      .from('auditorio')
      .select('*')
      .gte('data', from)
      .lte('data', to)
      .order('data', { ascending: true })
      .order('inicio', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error)
          setLoading(false)
          return
        }

        const map = new Map()
        for (const row of data) {
          const key = row.data
          if (!map.has(key)) map.set(key, [])
          map.get(key).push(row)
        }
        setReservationsMap(map)
        setLoading(false)
      })
  }, [year, month, tick])

  return { reservationsMap, loading, error, reload }
}
