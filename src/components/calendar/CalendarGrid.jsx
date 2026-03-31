import { CalendarCell } from './CalendarCell'
import styles from './CalendarGrid.module.css'

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Constrói o array de dias úteis (Seg–Sáb) do mês.
 * Retorna também o número de células em branco antes do primeiro dia.
 */
function buildMonthDays(year, month) {
  const days = []
  const lastDay = new Date(year, month + 1, 0).getDate()

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d)
    if (date.getDay() !== 0) { // 0 = domingo
      days.push(date)
    }
  }
  return days
}

function getLeadingOffset(year, month) {
  // Primeiro dia do mês
  const firstDate = new Date(year, month, 1)
  let dow = firstDate.getDay() // 0=Dom, 1=Seg, ..., 6=Sáb

  // Se o primeiro dia for domingo, avança para segunda
  if (dow === 0) {
    // Primeiro dia útil é segunda-feira → offset 0
    return 0
  }
  // Seg=1→0, Ter=2→1, Qua=3→2, Qui=4→3, Sex=5→4, Sáb=6→5
  return dow - 1
}

export function CalendarGrid({ year, month, reservationsMap, isAdmin, onNewReservation, onSelectReservation }) {
  const days = buildMonthDays(year, month)
  const offset = getLeadingOffset(year, month)

  return (
    <div className={styles.wrapper}>
      {/* Cabeçalho dos dias da semana */}
      <div className={styles.grid}>
        {DAY_LABELS.map(label => (
          <div key={label} className={styles.dayLabel}>{label}</div>
        ))}

        {/* Espaçadores iniciais */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`spacer-${i}`} className={styles.spacer} />
        ))}

        {/* Células dos dias */}
        {days.map(date => {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          const reservations = reservationsMap.get(key) || []
          return (
            <CalendarCell
              key={key}
              date={date}
              reservations={reservations}
              isAdmin={isAdmin}
              onNewReservation={onNewReservation}
              onSelectReservation={onSelectReservation}
            />
          )
        })}
      </div>
    </div>
  )
}
