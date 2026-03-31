import { HashRouter, Routes, Route } from 'react-router-dom'
import { PublicPage } from './pages/PublicPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './components/auth/LoginPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  )
}
