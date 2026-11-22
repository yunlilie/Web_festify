import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { FavoritesProvider } from './context/FavoritesContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AppRoutes />
        </FavoritesProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
