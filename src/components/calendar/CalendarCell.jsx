import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ReservationChip } from './ReservationChip'
import styles from './CalendarCell.module.css'

export function CalendarCell({ date, reservations = [], isAdmin = false, onNewReservation, onSelectReservation }) {
  const dayNum = format(date, 'd')
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  const handleCellClick = () => {
    if (isAdmin && onNewReservation) {
      onNewReservation(date)
    }
  }

  return (
    <div
      className={`${styles.cell} ${isAdmin ? styles.adminCell : ''}`}
      onClick={handleCellClick}
    >
      <span className={`${styles.dayNumber} ${isToday ? styles.today : ''}`}>{dayNum}</span>
      <div className={styles.chips}>
        {reservations.map(r => (
          <ReservationChip
            key={r.id}
            reservation={r}
            onClick={onSelectReservation}
          />
        ))}
      </div>
    </div>
  )
}
