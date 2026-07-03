import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <Routes>
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </div>
  )
}

export default App
