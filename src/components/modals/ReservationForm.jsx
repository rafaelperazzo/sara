import { useState } from 'react'
import { format } from 'date-fns'
import { Modal } from './Modal'
import { hasConflictLocal, hasConflictRemote } from '../../hooks/useConflict'
import { supabase } from '../../lib/supabase'
import styles from './ReservationForm.module.css'

/**
 * Formulário de criação/edição de reserva (área admin).
 *
 * @param {object} props
 * @param {Date|null} props.initialDate - data pré-selecionada (novo)
 * @param {object|null} props.reservation - reserva existente (edição)
 * @param {Array} props.allReservations - lista plana de reservas do mês (para conflito local)
 * @param {Function} props.onClose
 * @param {Function} props.onSaved - chamado após salvar com sucesso
 */
export function ReservationForm({ initialDate, reservation, allReservations = [], onClose, onSaved }) {
  const isEditing = !!reservation

  const [form, setForm] = useState({
    data: reservation?.data ?? (initialDate ? format(initialDate, 'yyyy-MM-dd') : ''),
    inicio: reservation?.inicio?.slice(0, 5) ?? '',
    fim: reservation?.fim?.slice(0, 5) ?? '',
    responsavel: reservation?.responsavel ?? '',
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.data || !form.inicio || !form.fim) {
      setError('Preencha data, início e fim.')
      return
    }
    if (form.inicio >= form.fim) {
      setError('O horário de início deve ser anterior ao fim.')
      return
    }

    // Verifica conflito localmente (mês carregado)
    const localConflict = hasConflictLocal(allReservations, {
      data: form.data,
      inicio: form.inicio,
      fim: form.fim,
      excludeId: isEditing ? reservation.id : null,
    })

    if (localConflict) {
      setError('Conflito de horário: já existe uma reserva nesse período.')
      return
    }

    // Verifica no servidor (edge case: data fora do mês carregado)
    setSaving(true)
    const remoteConflict = await hasConflictRemote({
      data: form.data,
      inicio: form.inicio,
      fim: form.fim,
      excludeId: isEditing ? reservation.id : null,
    })

    if (remoteConflict) {
      setError('Conflito de horário: já existe uma reserva nesse período.')
      setSaving(false)
      return
    }

    // Salva
    const payload = {
      data: form.data,
      inicio: form.inicio,
      fim: form.fim,
      responsavel: form.responsavel || null,
    }

    let queryError
    if (isEditing) {
      const { error } = await supabase
        .from('auditorio')
        .update(payload)
        .eq('id', reservation.id)
      queryError = error
    } else {
      const { error } = await supabase
        .from('auditorio')
        .insert(payload)
      queryError = error
    }

    setSaving(false)

    if (queryError) {
      setError('Erro ao salvar: ' + queryError.message)
      return
    }

    onSaved()
  }

  return (
    <Modal title={isEditing ? 'Editar Reserva' : 'Nova Reserva'} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="data">Data</label>
          <input
            id="data"
            type="date"
            value={form.data}
            onChange={set('data')}
            required
          />
        </div>
        <div className={styles.row2}>
          <div className={styles.field}>
            <label htmlFor="inicio">Início</label>
            <input
              id="inicio"
              type="time"
              value={form.inicio}
              onChange={set('inicio')}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="fim">Fim</label>
            <input
              id="fim"
              type="time"
              value={form.fim}
              onChange={set('fim')}
              required
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="responsavel">Responsável</label>
          <input
            id="responsavel"
            type="text"
            value={form.responsavel}
            onChange={set('responsavel')}
            placeholder="Nome do responsável"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={styles.btnSave} disabled={saving}>
            {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Reserva'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
