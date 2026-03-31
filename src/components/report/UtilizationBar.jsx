import styles from './UtilizationBar.module.css'

export function UtilizationBar({ percent }) {
  const color = percent >= 80 ? '#c53030' : percent >= 50 ? '#d69e2e' : '#2f855a'

  return (
    <div className={styles.track}>
      <div
        className={styles.fill}
        style={{ width: `${percent}%`, background: color }}
      />
    </div>
  )
}
