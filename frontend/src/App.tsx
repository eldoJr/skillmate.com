import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/organisms/header'
import DashboardLayout from './components/layout/dashboardLayout'
import LoginPage from './pages/auth/loginPage'
import RegisterPage from './pages/auth/registerPage'
import HomePage from './pages/home/homePage'
import DashboardPage from './pages/app/dashboardPage'
import ExplorePage from './pages/app/explorePage'
import ListingsPage from './pages/app/listingsPage'
import NewListingPage from './pages/app/newListingPage'
import RequestsPage from './pages/app/requestsPage'
import MessagesPage from './pages/app/messagesPage'
import NotificationsPage from './pages/app/notificationsPage'
import ProfilePage from './pages/app/profilePage'
import SettingsPage from './pages/app/settingsPage'

const authRoutes = ['/login', '/register']

function App() {
  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  if (authRoutes.includes(pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    )
  }

  if (pathname.startsWith('/app')) {
    const authed = localStorage.getItem('skillmate_auth') === 'true'
    if (!authed) return <Navigate to="/login" replace />

    return (
      <Routes>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/new" element={<NewListingPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#e6edf3]">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  )
}

export default App
