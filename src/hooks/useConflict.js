import { supabase } from '../lib/supabase'

/**
 * Verifica conflito localmente contra os dados já em memória.
 * Usa comparação lexicográfica de "HH:MM:SS" (funciona corretamente).
 *
 * @param {Array} reservations - lista plana de todas as reservas disponíveis
 * @param {object} params
 * @param {string} params.data - "YYYY-MM-DD"
 * @param {string} params.inicio - "HH:MM" ou "HH:MM:SS"
 * @param {string} params.fim - "HH:MM" ou "HH:MM:SS"
 * @param {number|null} params.excludeId - id a ignorar (para edições)
 * @returns {boolean}
 */
export function hasConflictLocal(reservations, { data, inicio, fim, excludeId = null }) {
  const sameDay = reservations.filter(r => r.data === data && r.id !== excludeId)
  return sameDay.some(r => inicio < r.fim && r.inicio < fim)
}

/**
 * Verifica conflito no servidor (para datas fora do mês carregado).
 * Retorna true se houver conflito, false se estiver livre.
 *
 * @param {object} params
 * @param {string} params.data - "YYYY-MM-DD"
 * @param {string} params.inicio - "HH:MM"
 * @param {string} params.fim - "HH:MM"
 * @param {number|null} params.excludeId
 * @returns {Promise<boolean>}
 */
export async function hasConflictRemote({ data, inicio, fim, excludeId = null }) {
  let query = supabase
    .from('auditorio')
    .select('id, inicio, fim')
    .eq('data', data)

  if (excludeId !== null) {
    query = query.neq('id', excludeId)
  }

  const { data: existing, error } = await query
  if (error || !existing) return false

  return existing.some(r => inicio < r.fim && r.inicio < fim)
}
