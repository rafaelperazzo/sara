import styles from './ReservationChip.module.css'

export function ReservationChip({ reservation, onClick }) {
  const inicio = reservation.inicio?.slice(0, 5) // "HH:MM"
  const fim = reservation.fim?.slice(0, 5)

  return (
    <button
      className={styles.chip}
      onClick={(e) => {
        e.stopPropagation()
        onClick(reservation)
      }}
      title={`${inicio}–${fim} | ${reservation.responsavel || 'Sem responsável'}`}
    >
      <span className={styles.time}>{inicio}–{fim}</span>
      {reservation.responsavel && (
        <span className={styles.name}>{reservation.responsavel}</span>
      )}
    </button>
  )
}
