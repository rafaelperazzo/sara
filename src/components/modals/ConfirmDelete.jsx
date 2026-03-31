import { useState } from 'react'
import { Modal } from './Modal'
import { supabase } from '../../lib/supabase'
import styles from './ConfirmDelete.module.css'

export function ConfirmDelete({ reservation, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase
      .from('auditorio')
      .delete()
      .eq('id', reservation.id)

    if (error) {
      setError('Erro ao remover: ' + error.message)
      setDeleting(false)
      return
    }
    onDeleted()
  }

  return (
    <Modal title="Remover Reserva" onClose={onClose}>
      <p className={styles.msg}>
        Tem certeza que deseja remover a reserva de{' '}
        <strong>{reservation.inicio?.slice(0, 5)}–{reservation.fim?.slice(0, 5)}</strong>{' '}
        {reservation.responsavel ? `(${reservation.responsavel})` : ''}?
      </p>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
        <button className={styles.btnDelete} onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Removendo...' : 'Remover'}
        </button>
      </div>
    </Modal>
  )
}
