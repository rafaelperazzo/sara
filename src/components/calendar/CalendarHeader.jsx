import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import styles from './CalendarHeader.module.css'

export function CalendarHeader({ year, month, onPrev, onNext }) {
  const date = new Date(year, month, 1)
  const label = format(date, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className={styles.header}>
      <button className={styles.arrow} onClick={onPrev} aria-label="Mês anterior">&#8249;</button>
      <h2 className={styles.label}>{label.charAt(0).toUpperCase() + label.slice(1)}</h2>
      <button className={styles.arrow} onClick={onNext} aria-label="Próximo mês">&#8250;</button>
    </div>
  )
}
