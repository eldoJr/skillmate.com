import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import Header from './components/organisms/header'
import DashboardLayout from './components/layout/dashboardLayout'
import LoginPage from './pages/auth/loginPage'
import RegisterPage from './pages/auth/registerPage'
import HomePage from './pages/home/homePage'
import DashboardPage from './pages/app/dashboardPage'
import ExplorePage from './pages/app/explorePage'
import ListingsPage from './pages/app/listingsPage'
import NewListingPage from './pages/app/newListingPage'
import ListingDetailPage from './pages/app/listingDetailPage'
import EditListingPage from './pages/app/editListingPage'
import RequestsPage from './pages/app/requestsPage'
import MessagesPage from './pages/app/messagesPage'
import NotificationsPage from './pages/app/notificationsPage'
import ProfilePage from './pages/app/profilePage'
import PublicProfilePage from './pages/app/publicProfilePage'
import SettingsPage from './pages/app/settingsPage'
import AiMentorPage from './pages/app/aiMentorPage'
import SkillGapPage from './pages/app/skillGapPage'
import CareerRoadmapPage from './pages/app/careerRoadmapPage'
import PortfolioPage from './pages/app/portfolioPage'
import MatchingPage from './pages/app/matchingPage'
import RecommendationsPage from './pages/app/recommendationsPage'
import ProposalsPage from './pages/app/proposalsPage'
import CompanyPage from './pages/app/companyPage'

const authRoutes = ['/login', '/register']

function ProtectedRoutes() {
  const { token, isLoading } = useAuth()
  if (isLoading) return null
  if (!token) return <Navigate to="/login" replace />
  return (
    <Routes>
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/new" element={<NewListingPage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        <Route path="listings/:id/edit" element={<EditListingPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:userId" element={<PublicProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="ai/mentor" element={<AiMentorPage />} />
        <Route path="ai/skill-gap" element={<SkillGapPage />} />
        <Route path="ai/roadmap" element={<CareerRoadmapPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="matching" element={<MatchingPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="proposals" element={<ProposalsPage />} />
        <Route path="company" element={<CompanyPage />} />
      </Route>
    </Routes>
  )
}

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
    return <ProtectedRoutes />
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
