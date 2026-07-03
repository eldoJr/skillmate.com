import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/organisms/header'
import LoginPage from './pages/auth/loginPage'
import RegisterPage from './pages/auth/registerPage'

const authRoutes = ['/login', '/register']

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (authRoutes.includes(pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-[#1f2328] dark:text-[#e6edf3]">
      <Header />
      <Routes>
        <Route path="/" element={<div className="p-8">Home</div>} />
      </Routes>
    </div>
  )
}

export default App
