import { Outlet } from 'react-router-dom'
import AppSidebar from '../app/appSidebar'
import AppHeader from '../app/appHeader'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#010409] text-[#1f2328] dark:text-[#e6edf3]">
      <AppSidebar />
      <div className="ml-[56px] flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
