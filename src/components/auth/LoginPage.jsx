import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) {
      navigate('/admin', { replace: true })
    }
  }, [session, loading, navigate])

  if (loading) return null

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>SARA</h1>
        <p className={styles.subtitle}>Auditório DC/UFRPE — Área Administrativa</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Entrar',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: 'Sua senha',
              },
            },
          }}
        />
      </div>
    </div>
  )
}
