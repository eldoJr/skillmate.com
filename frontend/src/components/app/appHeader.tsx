import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMagnifyingGlass,
  HiOutlineSun,
  HiChevronRight,
  HiChevronLeft,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineRectangleStack,
  HiOutlineSparkles,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import Avatar from '../atoms/avatar'
import { useAuth } from '../../contexts/AuthContext'
import { messagesService } from '../../services/messages'
import { notificationsService } from '../../services/notifications'
import api from '../../services/api'

interface SearchHit { id: string; type: string; title: string; subtitle?: string; data: Record<string, unknown> }
interface MultiSearchResponse { query: string; listings: { hits: SearchHit[] }; users: { hits: SearchHit[] }; skills: { hits: SearchHit[] }; total: number }

const routeMeta: Record<string, { label: string; parent?: string }> = {
  '/app':                  { label: 'Dashboard' },
  '/app/explore':          { label: 'Explore' },
  '/app/listings':         { label: 'My Listings' },
  '/app/listings/new':     { label: 'New Listing', parent: 'Listings' },
  '/app/requests':         { label: 'Requests' },
  '/app/messages':         { label: 'Messages' },
  '/app/notifications':    { label: 'Notifications' },
  '/app/profile':          { label: 'Profile' },
  '/app/settings':         { label: 'Settings' },
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function getRouteMeta(pathname: string) {
  if (routeMeta[pathname]) return routeMeta[pathname]
  if (/^\/app\/listings\/[^/]+\/edit$/.test(pathname)) return { label: 'Edit Listing', parent: 'Listings' }
  if (/^\/app\/listings\/[^/]+$/.test(pathname)) return { label: 'Listing', parent: 'Listings' }
  if (/^\/app\/profile\/[^/]+$/.test(pathname)) return { label: 'Profile', parent: 'Explore' }
  if (pathname === '/app/ai/mentor') return { label: 'AI Mentor', parent: 'AI' }
  if (pathname === '/app/ai/skill-gap') return { label: 'Skill Gap', parent: 'AI' }
  if (pathname === '/app/ai/roadmap') return { label: 'Career Roadmap', parent: 'AI' }
  if (pathname === '/app/portfolio') return { label: 'Portfolio' }
  if (pathname === '/app/matching') return { label: 'AI Matches' }
  if (pathname === '/app/recommendations') return { label: 'For You' }
  if (pathname === '/app/proposals') return { label: 'Proposals' }
  if (pathname === '/app/company') return { label: 'Company Matching' }
  return { label: 'Workspace' }
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export default function AppHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<MultiSearchResponse | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(search, 350)
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useClickOutside(avatarRef, () => setAvatarOpen(false))
  useClickOutside(searchRef, () => setSearchOpen(false))

  useEffect(() => {
    if (!debouncedSearch.trim()) { setSearchResults(null); setSearchOpen(false); return }
    setSearchLoading(true)
    api.get<MultiSearchResponse>('/search/', { params: { q: debouncedSearch, limit: 4 } })
      .then((r) => { setSearchResults(r.data); setSearchOpen(true) })
      .catch(() => {})
      .finally(() => setSearchLoading(false))
  }, [debouncedSearch])

  const handleSearchNav = useCallback((hit: SearchHit) => {
    setSearch('')
    setSearchOpen(false)
    if (hit.type === 'listing') navigate(`/app/listings/${hit.id}`)
    else if (hit.type === 'user') navigate(`/app/profile/${hit.id}`)
    else navigate(`/app/explore?search=${encodeURIComponent(hit.title)}`)
  }, [navigate])

  const handleSearchSubmit = () => {
    if (!search.trim()) return
    setSearchOpen(false)
    navigate(`/app/explore?search=${encodeURIComponent(search)}`)
    setSearch('')
  }

  const meta = getRouteMeta(pathname)
  const canGoBack = window.history.length > 1

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { user, logout } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  useEffect(() => {
    messagesService.getUnreadCount().then(setUnreadMessages)
    notificationsService.getUnreadCount().then(setUnreadNotifs)
  }, [])

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
  }

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 h-14 flex items-center gap-4 px-5 transition-shadow duration-300',
        'bg-[#f6f8fa] dark:bg-[#010409]',
        'border-b border-[#d0d7de]/40 dark:border-[#21262d]/60',
        scrolled && 'shadow-none',
      )}
    >
      {/* Left — back/forward + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => canGoBack && navigate(-1)}
            disabled={!canGoBack}
            className={clsx(
              'p-1 rounded-lg transition-colors',
              canGoBack
                ? 'text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer'
                : 'text-[#d0d7de] dark:text-[#30363d] cursor-default',
            )}
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1 rounded-lg transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-4 bg-[#d0d7de] dark:bg-[#30363d]" />

        <div className="flex items-center gap-1.5 min-w-0">
          {meta.parent && (
            <>
              <span className="text-sm text-[#636c76] dark:text-[#848d97]">{meta.parent}</span>
              <HiChevronRight className="w-3 h-3 text-[#d0d7de] dark:text-[#30363d] shrink-0" />
            </>
          )}
          <h1 className="text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">
            {meta.label}
          </h1>
        </div>
      </div>

      {/* Center — search */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block" ref={searchRef}>
        <div className={clsx('relative w-[380px] flex items-center overflow-hidden rounded-xl border bg-white dark:bg-[#161b22] transition-all', searchOpen ? 'border-[#0969da] dark:border-[#2f81f7]' : 'border-[#d0d7de] dark:border-[#30363d]')}>
          {searchLoading
            ? <HiOutlineArrowPath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin pointer-events-none" />
            : <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
          }
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => searchResults && setSearchOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search skills, students, listings…"
            className="flex-1 min-w-0 pl-9 pr-3 py-2 text-[13px] bg-transparent text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none"
          />
          <button onClick={handleSearchSubmit} className="shrink-0 self-stretch px-4 bg-[#0969da] dark:bg-[#2f81f7] hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer rounded-l-xl flex items-center justify-center">
            <HiOutlineMagnifyingGlass className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Dropdown */}
        {searchOpen && searchResults && searchResults.total > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#161b22] rounded-xl border border-[#d0d7de] dark:border-[#30363d] shadow-xl overflow-hidden">
            {searchResults.listings.hits.length > 0 && (
              <div>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest flex items-center gap-1.5">
                  <HiOutlineRectangleStack className="w-3 h-3" /> Listings
                </p>
                {searchResults.listings.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer text-left">
                    <HiOutlineRectangleStack className="w-4 h-4 text-[#636c76] dark:text-[#848d97] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">{hit.title}</p>
                      {hit.subtitle && <p className="text-[10px] text-[#636c76] dark:text-[#848d97] truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.users.hits.length > 0 && (
              <div className={searchResults.listings.hits.length > 0 ? 'border-t border-[#f6f8fa] dark:border-[#21262d]' : ''}>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest flex items-center gap-1.5">
                  <HiOutlineUser className="w-3 h-3" /> Students
                </p>
                {searchResults.users.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer text-left">
                    <Avatar name={hit.title} size="sm" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">{hit.title}</p>
                      {hit.subtitle && <p className="text-[10px] text-[#636c76] dark:text-[#848d97] truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.skills.hits.length > 0 && (
              <div className={searchResults.listings.hits.length > 0 || searchResults.users.hits.length > 0 ? 'border-t border-[#f6f8fa] dark:border-[#21262d]' : ''}>
                <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-[#636c76] dark:text-[#848d97] uppercase tracking-widest flex items-center gap-1.5">
                  <HiOutlineSparkles className="w-3 h-3" /> Skills
                </p>
                {searchResults.skills.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer text-left">
                    <HiOutlineSparkles className="w-4 h-4 text-[#636c76] dark:text-[#848d97] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-[#1f2328] dark:text-[#e6edf3] truncate">{hit.title}</p>
                      {hit.subtitle && <p className="text-[10px] text-[#636c76] dark:text-[#848d97] truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-[#f6f8fa] dark:border-[#21262d] px-3 py-2">
              <button onClick={handleSearchSubmit} className="text-[11px] text-[#0969da] dark:text-[#2f81f7] hover:underline cursor-pointer">
                See all results for "{search}"
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        {/* Messages */}
        <Link
          to="/app/messages"
          className="relative p-2 rounded-xl transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]"
        >
          <HiOutlineChatBubbleLeftRight className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 px-1 text-[9px] font-bold bg-[#0969da] dark:bg-[#2f81f7] text-white rounded-full flex items-center justify-center leading-none">
            {unreadMessages > 0 ? unreadMessages : null}
          </span>
        </Link>

        {/* Notifications */}
        <Link
          to="/app/notifications"
          className="relative p-2 rounded-xl transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]"
        >
          <HiOutlineBell className="w-[18px] h-[18px]" />
          {unreadNotifs > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1a7f37] dark:bg-[#3fb950] rounded-full ring-2 ring-white dark:ring-[#0d1117]" />}
        </Link>

        <div className="w-px h-5 bg-[#d0d7de] dark:bg-[#30363d] mx-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2 rounded-xl transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer"
        >
          <div className="relative w-[18px] h-[18px]">
            <HiOutlineSun className="w-[18px] h-[18px]" />
            {dark && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[22px] h-[1.5px] bg-current rotate-45 rounded-full" /></div>}
          </div>
        </button>

        <div className="w-px h-5 bg-[#d0d7de] dark:bg-[#30363d] mx-1" />

        {/* Avatar dropdown */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            <Avatar name={user?.full_name ?? 'S'} src={user?.avatar_url ?? undefined} size="sm" showStatus />
          </button>

          {avatarOpen && (
            <div className="absolute top-full right-0 mt-2 w-[190px] z-50 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-[#d0d7de] dark:border-[#30363d] py-1 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[#d0d7de] dark:border-[#30363d]">
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">{user?.full_name ?? 'Student'}</p>
                <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">{user?.email ?? ''}</p>
              </div>
              <div className="py-1">
                <Link to="/app/profile" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors">
                  <HiOutlineUser className="w-4 h-4" /> Profile
                </Link>
                <Link to="/app/settings" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors">
                  <HiOutlineCog6Tooth className="w-4 h-4" /> Settings
                </Link>
              </div>
              <div className="border-t border-[#d0d7de] dark:border-[#30363d] py-1">
                <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#d1242f] dark:text-[#f85149] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] transition-colors cursor-pointer">
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
