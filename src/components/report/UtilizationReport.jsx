import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UtilizationBar } from './UtilizationBar'
import { DAILY_CAPACITY_HOURS } from '../../lib/config'
import styles from './UtilizationReport.module.css'

const DAILY_CAPACITY_MINUTES = DAILY_CAPACITY_HOURS * 60

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function calcDayMinutes(reservations) {
  return reservations.reduce((acc, r) => {
    const start = parseTimeToMinutes(r.inicio)
    const end = parseTimeToMinutes(r.fim)
    return acc + Math.max(0, end - start)
  }, 0)
}

function calcPercent(minutes) {
  return Math.min(100, Math.round((minutes / DAILY_CAPACITY_MINUTES) * 100))
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function UtilizationReport({ year, month, reservationsMap }) {
  // Coletar todos os dias com dados ou dias úteis do mês
  const lastDay = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d)
    if (date.getDay() !== 0) days.push(date) // sem domingo
  }

  let totalMinutes = 0
  const rows = days.map(date => {
    const key = format(date, 'yyyy-MM-dd')
    const reservations = reservationsMap.get(key) || []
    const minutes = calcDayMinutes(reservations)
    totalMinutes += minutes
    const percent = calcPercent(minutes)
    return { date, key, minutes, percent, reservations }
  })

  const monthCapacity = days.length * DAILY_CAPACITY_MINUTES
  const monthPercent = Math.min(100, Math.round((totalMinutes / monthCapacity) * 100))

  const monthLabel = format(new Date(year, month, 1), 'MMMM yyyy', { locale: ptBR })

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>
        Relatório de Utilização — {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
      </h3>
      <p className={styles.info}>
        Capacidade diária: {DAILY_CAPACITY_HOURS}h = 100%
      </p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tempo Reservado</th>
            <th>Utilização</th>
            <th style={{ minWidth: 120 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ date, key, minutes, percent }) => (
            <tr key={key} className={minutes > 0 ? styles.active : ''}>
              <td>{format(date, 'EEE, dd/MM', { locale: ptBR })}</td>
              <td>{minutes > 0 ? formatMinutes(minutes) : '—'}</td>
              <td>{minutes > 0 ? `${percent}%` : '—'}</td>
              <td><UtilizationBar percent={percent} /></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={styles.total}>
            <td><strong>Total do Mês</strong></td>
            <td><strong>{formatMinutes(totalMinutes)}</strong></td>
            <td><strong>{monthPercent}%</strong></td>
            <td><UtilizationBar percent={monthPercent} /></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
