import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarHeader } from '../components/calendar/CalendarHeader'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { UtilizationReport } from '../components/report/UtilizationReport'
import { ReservationForm } from '../components/modals/ReservationForm'
import { ReservationDetail } from '../components/modals/ReservationDetail'
import { ConfirmDelete } from '../components/modals/ConfirmDelete'
import { useReservationsWithReload } from '../hooks/useReservations'
import { supabase } from '../lib/supabase'
import styles from './AdminPage.module.css'

const TABS = ['Calendário', 'Relatório de Utilização']

// Estados do modal admin ao clicar em uma reserva existente
const ADMIN_MODE = { VIEW: 'view', EDIT: 'edit', DELETE: 'delete' }

export function AdminPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [tab, setTab] = useState(0)

  // Modal: nova reserva
  const [newDate, setNewDate] = useState(null)

  // Modal: reserva selecionada
  const [selected, setSelected] = useState(null)
  const [adminMode, setAdminMode] = useState(null)

  const { reservationsMap, loading, reload } = useReservationsWithReload(year, month)
  const allReservations = Array.from(reservationsMap.values()).flat()

  const goToPrev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleSelectReservation = (reservation) => {
    setSelected(reservation)
    setAdminMode(ADMIN_MODE.VIEW)
  }

  const closeModal = () => {
    setSelected(null)
    setAdminMode(null)
    setNewDate(null)
  }

  const handleSaved = () => {
    closeModal()
    reload()
  }

  const handleDeleted = () => {
    closeModal()
    reload()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>SARA — Área Administrativa</h1>
            <p className={styles.subtitle}>Auditório DC/UFRPE</p>
          </div>
          <button className={styles.btnLogout} onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hint}>
          Clique em um dia para criar uma reserva. Clique em uma reserva para editá-la ou removê-la.
        </div>

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
            isAdmin={true}
            onNewReservation={setNewDate}
            onSelectReservation={handleSelectReservation}
          />
        ) : (
          <UtilizationReport year={year} month={month} reservationsMap={reservationsMap} />
        )}
      </main>

      {/* Modal: nova reserva */}
      {newDate && (
        <ReservationForm
          initialDate={newDate}
          allReservations={allReservations}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* Modal: detalhe/editar/remover */}
      {selected && adminMode === ADMIN_MODE.VIEW && (
        <AdminReservationActions
          reservation={selected}
          onEdit={() => setAdminMode(ADMIN_MODE.EDIT)}
          onDelete={() => setAdminMode(ADMIN_MODE.DELETE)}
          onClose={closeModal}
        />
      )}
      {selected && adminMode === ADMIN_MODE.EDIT && (
        <ReservationForm
          reservation={selected}
          allReservations={allReservations}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {selected && adminMode === ADMIN_MODE.DELETE && (
        <ConfirmDelete
          reservation={selected}
          onClose={closeModal}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

function AdminReservationActions({ reservation, onEdit, onDelete, onClose }) {
  const inicio = reservation.inicio?.slice(0, 5)
  const fim = reservation.fim?.slice(0, 5)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.actionsCard} onClick={e => e.stopPropagation()}>
        <div className={styles.actionsHeader}>
          <div>
            <strong>{inicio}–{fim}</strong>
            {reservation.responsavel && <span className={styles.resp}> · {reservation.responsavel}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <p className={styles.dateLabel}>{reservation.data}</p>
        <div className={styles.actionsBtns}>
          <button className={styles.btnEdit} onClick={onEdit}>Editar</button>
          <button className={styles.btnDel} onClick={onDelete}>Remover</button>
        </div>
      </div>
    </div>
  )
}
