import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { ReservationDetail } from '../components/modals/ReservationDetail'
import { UtilizationReport } from '../components/report/UtilizationReport'
import { useReservations } from '../hooks/useReservations'
import { CONTACT_EMAIL } from '../lib/config'
import styles from './PublicPage.module.css'

const TABS = ['Calendário', 'Relatório de Utilização']

export function PublicPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [tab, setTab] = useState(0)
  const [selected, setSelected] = useState(null)

  const { reservationsMap, loading } = useReservations(year, month)

  const goToPrev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Auditório DC/UFRPE</h1>
            <p className={styles.subtitle}>Sistema de Agendamento de Reservas do Auditório</p>
          </div>
          <button className={styles.contactLink} onClick={() => navigate('/admin')}>
            Área Administrativa
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === i ? styles.activeTab : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </div>

        <CalendarHeader year={year} month={month} onPrev={goToPrev} onNext={goToNext} />

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : tab === 0 ? (
          <CalendarGrid
            year={year}
            month={month}
            reservationsMap={reservationsMap}
            isAdmin={false}
            onSelectReservation={setSelected}
          />
        ) : (
          <UtilizationReport year={year} month={month} reservationsMap={reservationsMap} />
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          Para solicitar uma reserva, consulte o horário desejado e envie um e-mail para{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          <a href={`https://dc.ufrpe.br`}>Departamento de Computação - UFRPE</a>
        </p>
      </footer>

      {selected && (
        <ReservationDetail reservation={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
