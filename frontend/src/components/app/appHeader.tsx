import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlineBell,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMagnifyingGlass,
  HiOutlineSun,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineRectangleStack,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineBars3,
} from 'react-icons/hi2'
import Avatar from '../atoms/avatar'
import { useAuth } from '../../contexts/AuthContext'
import { messagesService } from '../../services/messages'
import { notificationsService } from '../../services/notifications'
import api from '../../services/api'
import { useSidebar } from './appSidebar'

const BACKEND_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace('/api/v1', '')

function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

interface SearchHit { id: string; type: string; title: string; subtitle?: string; data: Record<string, unknown> }
interface MultiSearchResponse { query: string; listings: { hits: SearchHit[] }; users: { hits: SearchHit[] }; skills: { hits: SearchHit[] }; total: number }

const routeMeta: Record<string, { label: string; parent?: string }> = {
  '/app':               { label: 'dashboard' },
  '/app/explore':       { label: 'explore' },
  '/app/listings':      { label: 'listings' },
  '/app/listings/new':  { label: 'new-listing', parent: 'listings' },
  '/app/requests':      { label: 'requests' },
  '/app/messages':      { label: 'messages' },
  '/app/notifications': { label: 'notifications' },
  '/app/profile':       { label: 'profile' },
  '/app/settings':      { label: 'settings' },
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
  if (/^\/app\/listings\/[^/]+\/edit$/.test(pathname)) return { label: 'edit-listing', parent: 'listings' }
  if (/^\/app\/listings\/[^/]+$/.test(pathname)) return { label: 'listing', parent: 'listings' }
  if (pathname === '/app/profile/edit') return { label: 'edit-profile', parent: 'profile' }
  if (/^\/app\/profile\/[^/]+$/.test(pathname)) return { label: 'profile', parent: 'explore' }
  if (pathname === '/app/ai/mentor') return { label: 'ai-mentor', parent: 'ai' }
  if (pathname === '/app/ai/skill-gap') return { label: 'skill-gap', parent: 'ai' }
  if (pathname === '/app/ai/roadmap') return { label: 'career-roadmap', parent: 'ai' }
  if (pathname === '/app/portfolio') return { label: 'portfolio' }
  if (pathname === '/app/matching') return { label: 'ai-matches' }
  if (pathname === '/app/recommendations') return { label: 'for-you' }
  if (pathname === '/app/proposals') return { label: 'proposals' }
  if (pathname === '/app/company') return { label: 'company-matching' }
  return { label: 'workspace' }
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
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(search, 350)
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useClickOutside(avatarRef, () => setAvatarOpen(false))
  useClickOutside(searchRef, () => { setSearchOpen(false); setSearchFocused(false) })

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const { user, logout, token } = useAuth()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  const refreshCounts = useCallback(() => {
    messagesService.getUnreadCount().then(setUnreadMessages).catch(() => {})
    notificationsService.getUnreadCount().then(setUnreadNotifs).catch(() => {})
  }, [])

  useEffect(() => {
    refreshCounts()
    const interval = setInterval(refreshCounts, 30_000)
    return () => clearInterval(interval)
  }, [refreshCounts])

  useEffect(() => {
    if (!token) return
    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(/^http/, 'ws')
    const ws = new WebSocket(`${apiBase}/notifications/ws?token=${token}`)
    ws.onmessage = (e) => {
      const { event } = JSON.parse(e.data)
      if (event === 'notification') setUnreadNotifs((n) => n + 1)
      if (event === 'new_message') setUnreadMessages((n) => n + 1)
    }
    return () => ws.close()
  }, [token])

  useEffect(() => {
    if (pathname === '/app/messages') setUnreadMessages(0)
    if (pathname === '/app/notifications') setUnreadNotifs(0)
  }, [pathname])

  const handleSignOut = () => { logout(); navigate('/login') }

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
  }

  const { openMobile } = useSidebar()

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 h-14 flex items-center gap-3 px-4 transition-shadow duration-300',
        'bg-[#fafafa] dark:bg-[#0a0c0f]',
        'border-b border-[#e2e4e8] dark:border-[#1e2228]',
        scrolled && 'shadow-none',
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={openMobile}
        className="md:hidden p-2 -ml-1 text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors cursor-pointer shrink-0"
        aria-label="Open navigation"
      >
        <HiOutlineBars3 className="w-5 h-5" />
      </button>

      {/* Left — terminal breadcrumb */}
      <div className="flex items-center min-w-0 shrink-0">
        <div className="flex items-center gap-1 font-mono text-[11px] tracking-wide">
          <span className="text-[#e8490f] dark:text-[#ff6b35] select-none">~/</span>
          {meta.parent && (
            <>
              <span className="text-[#636c76] dark:text-[#848d97]">{meta.parent}</span>
              <span className="text-[#d0d7de] dark:text-[#30363d] mx-0.5">/</span>
            </>
          )}
          <span className="text-[#1f2328] dark:text-[#e6edf3] font-medium">{meta.label}</span>
          <span className="text-[#e8490f] dark:text-[#ff6b35] animate-pulse select-none ml-0.5">_</span>
        </div>
      </div>

      {/* Center — search (flex-1 on md+, hidden on mobile) */}
      <div className="hidden md:flex flex-1 justify-center px-4" ref={searchRef}>
        <div className={clsx(
          'relative w-full max-w-[360px] flex items-center border bg-white dark:bg-[#0d1117] transition-all duration-150',
          searchFocused
            ? 'border-[#e8490f] dark:border-[#ff6b35]'
            : 'border-[#e2e4e8] dark:border-[#1e2228]',
        )}>
          {/* Terminal prompt */}
          <span className="absolute left-3 font-mono text-[11px] text-[#e8490f] dark:text-[#ff6b35] select-none pointer-events-none">
            {searchLoading ? '~' : '$'}
          </span>
          {searchLoading && (
            <HiOutlineArrowPath className="absolute left-7 top-1/2 -translate-y-1/2 w-3 h-3 text-[#636c76] dark:text-[#848d97] animate-spin pointer-events-none" />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { setSearchFocused(true); searchResults && setSearchOpen(true) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="search skills, students, listings…"
            className="flex-1 min-w-0 pl-10 pr-3 py-2 font-mono text-[11px] tracking-wide bg-transparent text-[#1f2328] dark:text-[#e6edf3] placeholder-[#adb5bd] dark:placeholder-[#4a5568] outline-none"
          />
          <button
            onClick={handleSearchSubmit}
            className="shrink-0 self-stretch px-3 border-l border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#161b22] hover:bg-[#e8490f] dark:hover:bg-[#ff6b35] hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center group"
          >
            <HiOutlineMagnifyingGlass className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Dropdown */}
        {searchOpen && searchResults && searchResults.total > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] shadow-xl overflow-hidden">
            {/* Terminal header */}
            <div className="px-3 py-1.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#161b22] flex items-center gap-1.5">
              <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">results for "{search}"</span>
            </div>
            {searchResults.listings.hits.length > 0 && (
              <div>
                <p className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-widest text-[#e8490f] dark:text-[#ff6b35] uppercase flex items-center gap-1.5">
                  <HiOutlineRectangleStack className="w-3 h-3" /> listings
                </p>
                {searchResults.listings.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors cursor-pointer text-left border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35]">
                    <HiOutlineRectangleStack className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] truncate">{hit.title}</p>
                      {hit.subtitle && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.users.hits.length > 0 && (
              <div className={searchResults.listings.hits.length > 0 ? 'border-t border-[#f6f8fa] dark:border-[#1e2228]' : ''}>
                <p className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-widest text-[#e8490f] dark:text-[#ff6b35] uppercase flex items-center gap-1.5">
                  <HiOutlineUser className="w-3 h-3" /> students
                </p>
                {searchResults.users.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors cursor-pointer text-left border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35]">
                    <Avatar name={hit.title} size="sm" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] truncate">{hit.title}</p>
                      {hit.subtitle && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.skills.hits.length > 0 && (
              <div className={searchResults.listings.hits.length > 0 || searchResults.users.hits.length > 0 ? 'border-t border-[#f6f8fa] dark:border-[#1e2228]' : ''}>
                <p className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-widest text-[#e8490f] dark:text-[#ff6b35] uppercase flex items-center gap-1.5">
                  <HiOutlineSparkles className="w-3 h-3" /> skills
                </p>
                {searchResults.skills.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors cursor-pointer text-left border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35]">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-[#636c76] dark:text-[#848d97] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] truncate">{hit.title}</p>
                      {hit.subtitle && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-[#e2e4e8] dark:border-[#1e2228] px-3 py-2 bg-[#f6f8fa] dark:bg-[#161b22]">
              <button onClick={handleSearchSubmit} className="font-mono text-[10px] text-[#e8490f] dark:text-[#ff6b35] hover:underline cursor-pointer">
                &gt; see all results for "{search}"
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
          className="relative p-2 transition-colors text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
        >
          <HiOutlineChatBubbleLeftRight className="w-[17px] h-[17px]" />
          {unreadMessages > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[13px] h-3 px-0.5 font-mono text-[8px] font-bold bg-[#e8490f] dark:bg-[#ff6b35] text-white flex items-center justify-center leading-none">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <Link
          to="/app/notifications"
          className="relative p-2 transition-colors text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]"
        >
          <HiOutlineBell className="w-[17px] h-[17px]" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[13px] h-3 px-0.5 font-mono text-[8px] font-bold bg-[#e8490f] dark:bg-[#ff6b35] text-white flex items-center justify-center leading-none">
              {unreadNotifs > 9 ? '9+' : unreadNotifs}
            </span>
          )}
        </Link>

        <div className="w-px h-4 bg-[#e2e4e8] dark:bg-[#1e2228] mx-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 transition-colors text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] cursor-pointer"
        >
          <div className="relative w-[17px] h-[17px]">
            <HiOutlineSun className="w-[17px] h-[17px]" />
            {dark && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[21px] h-[1.5px] bg-current rotate-45 rounded-full" /></div>}
          </div>
        </button>

        <div className="w-px h-4 bg-[#e2e4e8] dark:bg-[#1e2228] mx-1" />

        {/* Avatar dropdown */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            className="flex items-center gap-2 p-1 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors cursor-pointer"
          >
            <Avatar name={user?.full_name ?? 'S'} src={mediaUrl(user?.avatar_url)} size="sm" showStatus />
          </button>

          {avatarOpen && (
            <div className="absolute top-full right-0 mt-1 w-[200px] z-50 bg-[#fafafa] dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] shadow-xl overflow-hidden">
              {/* Terminal header */}
              <div className="px-3 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#161b22] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{user?.full_name ?? 'student'}</p>
                  <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] truncate">{user?.email ?? ''}</p>
                </div>
              </div>
              <div className="py-1">
                <Link to="/app/profile" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35]">
                  <HiOutlineUser className="w-3.5 h-3.5" /> profile
                </Link>
                <Link to="/app/settings" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors border-l-2 border-l-transparent hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35]">
                  <HiOutlineCog6Tooth className="w-3.5 h-3.5" /> settings
                </Link>
              </div>
              <div className="border-t border-[#e2e4e8] dark:border-[#1e2228] py-1">
                <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-[#d1242f] dark:text-[#f85149] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-[#d1242f]">
                  <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5" /> sign-out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
