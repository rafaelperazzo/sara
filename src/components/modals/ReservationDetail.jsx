import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Modal } from './Modal'
import styles from './ReservationDetail.module.css'

export function ReservationDetail({ reservation, onClose }) {
  if (!reservation) return null

  const dateLabel = format(parseISO(reservation.data), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const inicio = reservation.inicio?.slice(0, 5)
  const fim = reservation.fim?.slice(0, 5)

  return (
    <Modal title="Detalhes da Reserva" onClose={onClose}>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt>Data</dt>
          <dd>{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Horário</dt>
          <dd>{inicio} – {fim}</dd>
        </div>
        <div className={styles.row}>
          <dt>Responsável</dt>
          <dd>{reservation.responsavel || '—'}</dd>
        </div>
      </dl>
    </Modal>
  )
}
