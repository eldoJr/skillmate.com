import { useState, useEffect, useRef } from 'react'
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
  HiArrowRight,
} from 'react-icons/hi2'
import Avatar from '../atoms/avatar'

const routeMeta: Record<string, { label: string; parent?: string }> = {
  '/app':               { label: 'Dashboard' },
  '/app/explore':       { label: 'Explore' },
  '/app/listings':      { label: 'My Listings' },
  '/app/listings/new':  { label: 'New Listing', parent: 'Listings' },
  '/app/requests':      { label: 'Requests' },
  '/app/messages':      { label: 'Messages' },
  '/app/notifications': { label: 'Notifications' },
  '/app/profile':       { label: 'Profile' },
  '/app/settings':      { label: 'Settings' },
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
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useClickOutside(avatarRef, () => setAvatarOpen(false))

  const meta = routeMeta[pathname] || { label: 'Workspace' }
  const canGoBack = window.history.length > 1

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('skillmate_auth')
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
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        <div className="relative w-[380px] flex items-center overflow-hidden rounded-xl border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] focus-within:border-[#0969da] dark:focus-within:border-[#2f81f7] transition-all">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636c76] dark:text-[#848d97] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills, students, listings…"
            className="flex-1 min-w-0 pl-9 pr-3 py-2 text-[13px] bg-transparent text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none"
          />
          <button className="shrink-0 self-stretch px-4 bg-[#0969da] dark:bg-[#2f81f7] hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer rounded-l-xl flex items-center justify-center">
            <HiArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
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
            3
          </span>
        </Link>

        {/* Notifications */}
        <Link
          to="/app/notifications"
          className="relative p-2 rounded-xl transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]"
        >
          <HiOutlineBell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1a7f37] dark:bg-[#3fb950] rounded-full ring-2 ring-white dark:ring-[#0d1117]" />
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
            <Avatar name="A" size="sm" showStatus />
          </button>

          {avatarOpen && (
            <div className="absolute top-full right-0 mt-2 w-[190px] z-50 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-[#d0d7de] dark:border-[#30363d] py-1 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-[#d0d7de] dark:border-[#30363d]">
                <p className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Student</p>
                <p className="text-[11px] text-[#636c76] dark:text-[#848d97]">student@university.edu</p>
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
