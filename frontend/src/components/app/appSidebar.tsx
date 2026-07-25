import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSquares2X2,
  HiOutlineMagnifyingGlass,
  HiOutlineRectangleStack,
  HiOutlineClipboardDocumentList,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineBars3,
  HiOutlinePlusCircle,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineBeaker,
} from 'react-icons/hi2'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  route: string
}

const mainNav: NavItem[] = [
  { icon: HiOutlineSquares2X2,           label: 'Dashboard',  route: '/app' },
  { icon: HiOutlineMagnifyingGlass,      label: 'Explore',    route: '/app/explore' },
  { icon: HiOutlineRectangleStack,       label: 'Listings',   route: '/app/listings' },
  { icon: HiOutlineClipboardDocumentList,label: 'Requests',   route: '/app/requests' },
  { icon: HiOutlineChatBubbleLeftRight,  label: 'Messages',   route: '/app/messages' },
]

const aiNav: NavItem[] = [
  { icon: HiOutlineSparkles, label: 'AI Mentor',   route: '/app/ai/mentor' },
  { icon: HiOutlineBeaker,   label: 'Skill Gap',   route: '/app/ai/skill-gap' },
  { icon: HiOutlineMapPin,   label: 'Roadmap',     route: '/app/ai/roadmap' },
]

const bottomNav: NavItem[] = [
  { icon: HiOutlinePlusCircle, label: 'New Listing', route: '/app/listings/new' },
]

const COLLAPSE_DELAY = 220

function SidebarLink({ item, expanded, active }: { item: NavItem; expanded: boolean; active: boolean }) {
  const Icon = item.icon
  const [tip, setTip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => !expanded && setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      <Link
        to={item.route}
        className={clsx(
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          active
            ? 'text-[#0969da] dark:text-[#2f81f7] bg-[#ddf4ff] dark:bg-[#121d2f]'
            : 'text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]',
        )}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-[#0969da] dark:bg-[#2f81f7]" />
        )}
        <div className="shrink-0 flex items-center justify-center w-5 h-5">
          <Icon className="w-5 h-5" />
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.08 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-2.5 py-1.5 rounded-lg bg-[#1f2328] dark:bg-[#e6edf3] text-white dark:text-[#1f2328] text-[11px] font-medium whitespace-nowrap shadow-lg pointer-events-none"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const menuItems = [
  { label: 'Profile',           href: '/app/profile' },
  { label: 'Settings',          href: '/app/settings' },
  { label: 'Switch appearance', action: 'theme' },
  { label: 'Sign out',          action: 'signout', danger: true },
] as const

export default function AppSidebar() {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const expand = useCallback(() => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current)
    setExpanded(true)
  }, [])

  const collapse = useCallback(() => {
    collapseTimer.current = setTimeout(() => {
      setExpanded(false)
      setMenuOpen(false)
    }, COLLAPSE_DELAY)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => { if (!expanded) setMenuOpen(false) }, [expanded])

  const isActive = (route: string) =>
    route === '/app' ? pathname === '/app' : pathname.startsWith(route)

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
  }

  const handleSignOut = () => {
    localStorage.removeItem('skillmate_auth')
    navigate('/login')
  }

  const handleMenuClick = (item: typeof menuItems[number]) => {
    setMenuOpen(false)
    if ('action' in item && item.action === 'theme') toggleTheme()
    else if ('action' in item && item.action === 'signout') handleSignOut()
    else if ('href' in item) navigate(item.href)
  }

  return (
    <aside
      onMouseEnter={expand}
      onMouseLeave={collapse}
      className={clsx(
        'fixed top-0 left-0 z-40 flex flex-col h-screen transition-[width] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
        expanded ? 'w-[210px]' : 'w-[56px]',
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center shrink-0 px-3.5 overflow-hidden">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <img src="/ico.svg" alt="Skillmate" width={22} height={22} />
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <img src="/ico.svg" alt="Skillmate" width={22} height={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col justify-center py-3 px-2 gap-0.5">
        {mainNav.map((item) => (
          <SidebarLink key={item.route} item={item} expanded={expanded} active={isActive(item.route)} />
        ))}

        <div className="flex justify-center py-3">
          <div className="flex gap-[3px]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#d0d7de] dark:bg-[#30363d]" />
            ))}
          </div>
        </div>

        {aiNav.map((item) => (
          <SidebarLink key={item.route} item={item} expanded={expanded} active={isActive(item.route)} />
        ))}

        <div className="flex justify-center py-3">
          <div className="flex gap-[3px]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#d0d7de] dark:bg-[#30363d]" />
            ))}
          </div>
        </div>

        {bottomNav.map((item) => (
          <SidebarLink key={item.route} item={item} expanded={expanded} active={isActive(item.route)} />
        ))}
      </nav>

      {/* More menu */}
      <div className="py-3 px-2 relative" ref={menuRef}>
        <button
          onClick={() => expanded && setMenuOpen((v) => !v)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 w-full cursor-pointer text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]"
        >
          <HiOutlineBars3 className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
              >
                More
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full left-1 mb-2 w-[200px] z-50 bg-white dark:bg-[#161b22] rounded-xl shadow-lg border border-[#d0d7de] dark:border-[#30363d] py-1.5"
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item)}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-[13px] transition-colors cursor-pointer',
                    'danger' in item && item.danger
                      ? 'text-[#d1242f] dark:text-[#f85149] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216]'
                      : 'text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
