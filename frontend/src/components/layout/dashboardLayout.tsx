import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppSidebar, { SidebarContext } from '../app/appSidebar'
import AppHeader from '../app/appHeader'
import ProgressBar from '../atoms/progressBar'

export default function DashboardLayout() {
  const { pathname } = useLocation()
  const [loading, setLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [pathname])

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <SidebarContext.Provider value={{ openMobile: () => setMobileOpen(true) }}>
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080a0d] text-[#1f2328] dark:text-[#e6edf3]">
        <ProgressBar loading={loading} />
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="ml-0 md:ml-[52px] lg:ml-[220px] flex flex-col min-h-screen">
          <AppHeader />
          <main className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto px-5 py-5 min-h-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
