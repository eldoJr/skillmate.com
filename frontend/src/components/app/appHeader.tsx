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
        'bg-canvas-subtle dark:bg-canvas-dark-default',
        'border-b border-border-default dark:border-border-dark-default',
        scrolled && 'shadow-none',
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={openMobile}
        className="md:hidden p-2 -ml-1 text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors cursor-pointer shrink-0"
        aria-label="Open navigation"
      >
        <HiOutlineBars3 className="w-5 h-5" />
      </button>

      {/* Left — terminal breadcrumb */}
      <div className="flex items-center min-w-0 shrink-0">
        <div className="flex items-center gap-1 font-mono text-[11px] tracking-wide">
          <span className="text-brand dark:text-brand-dark-DEFAULT select-none">~/</span>
          {meta.parent && (
            <>
              <span className="text-fg-muted dark:text-fg-dark-muted">{meta.parent}</span>
              <span className="text-border-default dark:text-border-dark-default mx-0.5">/</span>
            </>
          )}
          <span className="text-fg-default dark:text-fg-dark-default font-medium">{meta.label}</span>
          <span className="text-brand dark:text-brand-dark-DEFAULT animate-pulse select-none ml-0.5">_</span>
        </div>
      </div>

      {/* Center — search */}
      <div className="hidden md:flex flex-1 justify-center px-4" ref={searchRef}>
        <div className={clsx(
          'relative w-full max-w-[360px] flex items-center border bg-canvas-overlay dark:bg-canvas-dark-inset transition-all duration-150',
          searchFocused
            ? 'border-brand dark:border-brand-dark-DEFAULT'
            : 'border-border-default dark:border-border-dark-default',
        )}>
          <span className="absolute left-3 font-mono text-[11px] text-brand dark:text-brand-dark-DEFAULT select-none pointer-events-none">
            {searchLoading ? '~' : '$'}
          </span>
          {searchLoading && (
            <HiOutlineArrowPath className="absolute left-7 top-1/2 -translate-y-1/2 w-3 h-3 text-fg-muted dark:text-fg-dark-muted animate-spin pointer-events-none" />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { setSearchFocused(true); searchResults && setSearchOpen(true) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="search skills, students, listings…"
            className="flex-1 min-w-0 pl-10 pr-3 py-2 font-mono text-[11px] tracking-wide bg-transparent text-fg-default dark:text-fg-dark-default placeholder-fg-subtle dark:placeholder-fg-dark-subtle outline-none"
          />
          <button
            onClick={handleSearchSubmit}
            className="shrink-0 self-stretch px-3 border-l border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-overlay hover:bg-brand dark:hover:bg-brand-dark-DEFAULT hover:text-white transition-colors duration-150 cursor-pointer flex items-center justify-center group"
          >
            <HiOutlineMagnifyingGlass className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Dropdown */}
        {searchOpen && searchResults && searchResults.total > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-canvas-overlay dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default shadow-xl overflow-hidden">
            <div className="px-3 py-1.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-overlay flex items-center gap-1.5">
              <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">results for "{search}"</span>
            </div>
            {searchResults.listings.hits.length > 0 && (
              <div>
                <p className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-widest text-brand dark:text-brand-dark-DEFAULT uppercase flex items-center gap-1.5">
                  <HiOutlineRectangleStack className="w-3 h-3" /> listings
                </p>
                {searchResults.listings.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay transition-colors cursor-pointer text-left border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT">
                    <HiOutlineRectangleStack className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-fg-default dark:text-fg-dark-default truncate">{hit.title}</p>
                      {hit.subtitle && <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.users.hits.length > 0 && (
              <div className={searchResults.listings.hits.length > 0 ? 'border-t border-border-subtle dark:border-border-dark-muted' : ''}>
                <p className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-widest text-brand dark:text-brand-dark-DEFAULT uppercase flex items-center gap-1.5">
                  <HiOutlineUser className="w-3 h-3" /> students
                </p>
                {searchResults.users.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay transition-colors cursor-pointer text-left border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT">
                    <Avatar name={hit.title} size="sm" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-fg-default dark:text-fg-dark-default truncate">{hit.title}</p>
                      {hit.subtitle && <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.skills.hits.length > 0 && (
              <div className={searchResults.listings.hits.length > 0 || searchResults.users.hits.length > 0 ? 'border-t border-border-subtle dark:border-border-dark-muted' : ''}>
                <p className="px-3 pt-2 pb-1 font-mono text-[9px] tracking-widest text-brand dark:text-brand-dark-DEFAULT uppercase flex items-center gap-1.5">
                  <HiOutlineSparkles className="w-3 h-3" /> skills
                </p>
                {searchResults.skills.hits.map((hit) => (
                  <button key={hit.id} onClick={() => handleSearchNav(hit)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay transition-colors cursor-pointer text-left border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT">
                    <HiOutlineSparkles className="w-3.5 h-3.5 text-fg-muted dark:text-fg-dark-muted shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-fg-default dark:text-fg-dark-default truncate">{hit.title}</p>
                      {hit.subtitle && <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted truncate">{hit.subtitle}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-border-default dark:border-border-dark-default px-3 py-2 bg-canvas-inset dark:bg-canvas-dark-overlay">
              <button onClick={handleSearchSubmit} className="font-mono text-[10px] text-brand dark:text-brand-dark-DEFAULT hover:underline cursor-pointer">
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
          className="relative p-2 transition-colors text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay"
        >
          <HiOutlineChatBubbleLeftRight className="w-[17px] h-[17px]" />
          {unreadMessages > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[13px] h-3 px-0.5 font-mono text-[8px] font-bold bg-brand dark:bg-brand-dark-DEFAULT text-white flex items-center justify-center leading-none">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <Link
          to="/app/notifications"
          className="relative p-2 transition-colors text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay"
        >
          <HiOutlineBell className="w-[17px] h-[17px]" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[13px] h-3 px-0.5 font-mono text-[8px] font-bold bg-brand dark:bg-brand-dark-DEFAULT text-white flex items-center justify-center leading-none">
              {unreadNotifs > 9 ? '9+' : unreadNotifs}
            </span>
          )}
        </Link>

        <div className="w-px h-4 bg-border-default dark:bg-border-dark-default mx-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 transition-colors text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay cursor-pointer"
        >
          <div className="relative w-[17px] h-[17px]">
            <HiOutlineSun className="w-[17px] h-[17px]" />
            {dark && <div className="absolute inset-0 flex items-center justify-center"><div className="w-[21px] h-[1.5px] bg-current rotate-45 rounded-full" /></div>}
          </div>
        </button>

        <div className="w-px h-4 bg-border-default dark:bg-border-dark-default mx-1" />

        {/* Avatar dropdown */}
        <div ref={avatarRef} className="relative">
          <button
            onClick={() => setAvatarOpen((v) => !v)}
            className="flex items-center gap-2 p-1 hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay transition-colors cursor-pointer"
          >
            <Avatar name={user?.full_name ?? 'S'} src={mediaUrl(user?.avatar_url)} size="sm" showStatus />
          </button>

          {avatarOpen && (
            <div className="absolute top-full right-0 mt-1 w-[200px] z-50 bg-canvas-subtle dark:bg-canvas-dark-inset border border-border-default dark:border-border-dark-default shadow-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-overlay flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT" />
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-semibold text-fg-default dark:text-fg-dark-default truncate">{user?.full_name ?? 'student'}</p>
                  <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted truncate">{user?.email ?? ''}</p>
                </div>
              </div>
              <div className="py-1">
                <Link to="/app/profile" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay hover:text-fg-default dark:hover:text-fg-dark-default transition-colors border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT">
                  <HiOutlineUser className="w-3.5 h-3.5" /> profile
                </Link>
                <Link to="/app/settings" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-fg-muted dark:text-fg-dark-muted hover:bg-canvas-inset dark:hover:bg-canvas-dark-overlay hover:text-fg-default dark:hover:text-fg-dark-default transition-colors border-l-2 border-l-transparent hover:border-l-brand dark:hover:border-l-brand-dark-DEFAULT">
                  <HiOutlineCog6Tooth className="w-3.5 h-3.5" /> settings
                </Link>
              </div>
              <div className="border-t border-border-default dark:border-border-dark-default py-1">
                <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-danger-fg dark:text-danger-dark-fg hover:bg-danger-subtle dark:hover:bg-danger-dark-subtle transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-danger-fg">
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
