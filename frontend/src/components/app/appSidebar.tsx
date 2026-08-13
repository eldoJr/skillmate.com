import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiOutlineSquares2X2,
  HiOutlineMagnifyingGlass,
  HiOutlineRectangleStack,
  HiOutlineClipboardDocumentList,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCog6Tooth,
  HiOutlineBars3,
  HiOutlinePlusCircle,
  HiOutlineSparkles,
  HiOutlineMapPin,
  HiOutlineBeaker,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlinePhoto,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  route: string
}

const mainNav: NavItem[] = [
  { icon: HiOutlineSquares2X2,            label: 'Dashboard',  route: '/app' },
  { icon: HiOutlineMagnifyingGlass,       label: 'Explore',    route: '/app/explore' },
  { icon: HiOutlineRectangleStack,        label: 'Listings',   route: '/app/listings' },
  { icon: HiOutlineClipboardDocumentList, label: 'Requests',   route: '/app/requests' },
  { icon: HiOutlineChatBubbleLeftRight,   label: 'Messages',   route: '/app/messages' },
]

const aiMentor: NavItem = { icon: HiOutlineSparkles, label: 'AI Mentor', route: '/app/ai/mentor' }

const overflowNav: NavItem[] = [
  { icon: HiOutlineBeaker,          label: 'Skill Gap',   route: '/app/ai/skill-gap' },
  { icon: HiOutlineMapPin,          label: 'Roadmap',     route: '/app/ai/roadmap' },
  { icon: HiOutlineStar,            label: 'Matches',     route: '/app/matching' },
  { icon: HiOutlineSparkles,        label: 'For You',     route: '/app/recommendations' },
  { icon: HiOutlineDocumentText,    label: 'Proposals',   route: '/app/proposals' },
  { icon: HiOutlinePhoto,           label: 'Portfolio',   route: '/app/portfolio' },
  { icon: HiOutlineBuildingOffice2, label: 'Company',     route: '/app/company' },
  { icon: HiOutlinePlusCircle,      label: 'New Listing', route: '/app/listings/new' },
]

const menuItems = [
  { label: 'profile',      href: '/app/profile' },
  { label: 'settings',     href: '/app/settings' },
  { label: 'toggle theme', action: 'theme' },
  { label: 'sign out',     action: 'signout', danger: true },
] as const

function useIsLg() {
  const [isLg, setIsLg] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isLg
}

function NavLink({
  item, showLabel, active, onClick, aiIcon,
}: {
  item: NavItem; showLabel: boolean; active: boolean; onClick?: () => void; aiIcon?: boolean
}) {
  const Icon = item.icon
  const [tip, setTip] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => !showLabel && setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      <Link
        to={item.route}
        onClick={onClick}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 transition-all duration-150 font-mono text-[11px] tracking-wide border-l-2',
          active
            ? 'border-l-[#e8490f] dark:border-l-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d] dark:bg-[#ff6b3510]'
            : 'border-l-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]/60',
        )}
      >
        <div className="shrink-0 flex items-center justify-center w-4 h-4">
          {aiIcon
            ? <img src="/icons/ai-icon.png" alt="AI" className="w-4 h-4 object-contain" />
            : <Icon className="w-4 h-4" />}
        </div>
        {showLabel && (
          <span className="whitespace-nowrap overflow-hidden">
            {active && <span className="text-[#e8490f] dark:text-[#ff6b35] mr-1 opacity-70">&gt;</span>}
            {item.label}
          </span>
        )}
      </Link>

      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.08 }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-2.5 py-1.5 bg-[#1f2328] dark:bg-[#e6edf3] text-white dark:text-[#1f2328] text-[10px] font-mono tracking-wide whitespace-nowrap shadow-lg pointer-events-none border border-[#30363d] dark:border-[#d0d7de]"
          >
            <span className="text-[#e8490f] mr-1">&gt;</span>{item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface SidebarBodyProps {
  showLabel: boolean
  isActive: (r: string) => boolean
  onNavClick?: () => void
  onMenuAction: (item: typeof menuItems[number]) => void
}

function usePortalPos(ref: React.RefObject<HTMLElement | null>, open: boolean, dropHeight = 160) {
  const [pos, setPos] = useState({ top: 0, left: 0 })
  useEffect(() => {
    if (open && ref.current) {
      const r = ref.current.getBoundingClientRect()
      const top = Math.min(r.top, window.innerHeight - dropHeight - 8)
      setPos({ top, left: r.right + 8 })
    }
  }, [open, ref, dropHeight])
  return pos
}

function SidebarBody({ showLabel, isActive, onNavClick, onMenuAction }: SidebarBodyProps) {
  const [overflowOpen, setOverflowOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const overflowBtnRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const overflowDropRef = useRef<HTMLDivElement>(null)
  const menuDropRef = useRef<HTMLDivElement>(null)

  const overflowPos = usePortalPos(overflowBtnRef, overflowOpen, overflowNav.length * 32 + 8)
  const menuPos = usePortalPos(menuBtnRef, menuOpen, menuItems.length * 32 + 40)

  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Node
      if (overflowOpen && !overflowBtnRef.current?.contains(t) && !overflowDropRef.current?.contains(t)) setOverflowOpen(false)
      if (menuOpen && !menuBtnRef.current?.contains(t) && !menuDropRef.current?.contains(t)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [overflowOpen, menuOpen])

  return (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center shrink-0 px-4 border-b border-[#e2e4e8] dark:border-[#1e2228] gap-3 overflow-hidden">
        <img src="/ico.svg" alt="Skillmate" width={20} height={20} className="shrink-0" />
        {showLabel && (
          <span className="font-mono text-[11px] font-semibold tracking-widest text-[#1f2328] dark:text-[#e6edf3] uppercase whitespace-nowrap">
            skillmate
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col justify-center py-4 gap-0 overflow-y-auto">
        {mainNav.map((item) => (
          <NavLink key={item.route} item={item} showLabel={showLabel} active={isActive(item.route)} onClick={onNavClick} />
        ))}

        <div className="my-2 mx-3 h-px bg-[#e2e4e8] dark:bg-[#1e2228]" />

        <NavLink item={aiMentor} showLabel={showLabel} active={isActive(aiMentor.route)} onClick={onNavClick} aiIcon />

        {/* Overflow */}
        <button
          ref={overflowBtnRef}
          onClick={() => setOverflowOpen((v) => !v)}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 transition-all duration-150 w-full cursor-pointer font-mono text-[11px] tracking-wide border-l-2',
            overflowOpen || overflowNav.some((i) => isActive(i.route))
              ? 'border-l-[#e8490f] dark:border-l-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d] dark:bg-[#ff6b3510]'
              : 'border-l-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]/60',
          )}
        >
          <div className="shrink-0 flex items-center justify-center w-4 h-4">
            <HiOutlineBars3 className="w-4 h-4" />
          </div>
          {showLabel && <span className="whitespace-nowrap flex-1 text-left">more</span>}
        </button>

        {overflowOpen && createPortal(
          <AnimatePresence>
            <motion.div
              ref={overflowDropRef}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              style={{ position: 'fixed', top: overflowPos.top, left: overflowPos.left, zIndex: 9999 }}
              className="bg-[#fafafa] dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] py-1 shadow-lg w-[160px]"
            >
              {overflowNav.map((item) => {
                const active = isActive(item.route)
                return (
                  <Link
                    key={item.route}
                    to={item.route}
                    onClick={() => { setOverflowOpen(false); onNavClick?.() }}
                    className={clsx(
                      'block px-4 py-1.5 font-mono text-[10px] tracking-wide transition-colors border-l-2',
                      active
                        ? 'border-l-[#e8490f] dark:border-l-[#ff6b35] text-[#e8490f] dark:text-[#ff6b35] bg-[#e8490f0d]'
                        : 'border-l-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]/60',
                    )}
                  >
                    {active && <span className="text-[#e8490f] dark:text-[#ff6b35] mr-1">&gt;</span>}
                    {item.label}
                  </Link>
                )
              })}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </nav>

      {/* Settings */}
      <div className="py-3 border-t border-[#e2e4e8] dark:border-[#1e2228]">
        <button
          ref={menuBtnRef}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-150 w-full cursor-pointer font-mono text-[11px] tracking-wide border-l-2 border-l-transparent text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]/60"
        >
          <HiOutlineCog6Tooth className="w-4 h-4 shrink-0" />
          {showLabel && <span className="whitespace-nowrap">settings</span>}
        </button>

        {menuOpen && createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuDropRef}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
              className="w-[180px] bg-[#fafafa] dark:bg-[#0d1117] border border-[#e2e4e8] dark:border-[#1e2228] py-1 shadow-lg"
            >
              <div className="px-3 py-1.5 border-b border-[#e2e4e8] dark:border-[#1e2228] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
                <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">menu</span>
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setMenuOpen(false); onMenuAction(item) }}
                  className={clsx(
                    'w-full text-left px-4 py-1.5 font-mono text-[10px] tracking-wide transition-colors cursor-pointer border-l-2 border-l-transparent',
                    'danger' in item && item.danger
                      ? 'text-[#d1242f] dark:text-[#f85149] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] hover:border-l-[#d1242f]'
                      : 'text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]/60 hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:border-l-[#e8490f] dark:hover:border-l-[#ff6b35]',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
      </div>
    </>
  )
}

// Context so AppHeader can trigger the mobile drawer
export const SidebarContext = createContext<{ openMobile: () => void }>({ openMobile: () => {} })
export function useSidebar() { return useContext(SidebarContext) }

interface AppSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function AppSidebar({ mobileOpen, onMobileClose }: AppSidebarProps) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const isLg = useIsLg()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = useCallback((route: string) =>
    route === '/app' ? pathname === '/app' : pathname.startsWith(route),
  [pathname])

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

  const handleMenuAction = (item: typeof menuItems[number]) => {
    if ('action' in item && item.action === 'theme') toggleTheme()
    else if ('action' in item && item.action === 'signout') handleSignOut()
    else if ('href' in item) navigate(item.href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden md:flex fixed top-0 left-0 z-40 flex-col h-screen border-r border-[#e2e4e8] dark:border-[#1e2228]',
        isLg ? 'w-[220px]' : 'w-[52px]',
      )}>
        <SidebarBody
          showLabel={isLg}
          isActive={isActive}
          onMenuAction={handleMenuAction}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 left-0 z-50 flex flex-col h-screen w-[260px] bg-[#fafafa] dark:bg-[#0a0c0f] border-r border-[#e2e4e8] dark:border-[#1e2228] md:hidden"
            >
              <SidebarBody
                showLabel={true}
                isActive={isActive}
                onNavClick={onMobileClose}
                onMenuAction={handleMenuAction}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
