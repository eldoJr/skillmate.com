import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineSun } from 'react-icons/hi2'
import Logo from '../atoms/logo'
import Avatar from '../atoms/avatar'
import Button from '../atoms/button'
import NavLink from '../molecules/navLink'
import Dropdown, { DropdownItem } from '../molecules/dropdown'

const navItems = [
  { label: 'Explore',   href: '/explore' },
  { label: 'Listings',  href: '/listings' },
  { label: 'Messages',  href: '/messages' },
  { label: 'Reviews',   href: '/reviews' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isAuthenticated = false // TODO: replace with real auth state

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center">
      <motion.header
        animate={{
          maxWidth: scrolled ? 1250 : 1400,
          borderRadius: scrolled ? 16 : 0,
          marginTop: scrolled ? 12 : 0,
          paddingLeft: scrolled ? 24 : 0,
          paddingRight: scrolled ? 24 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full"
      >
        {/* Glass background — visible on scroll */}
        <motion.div
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 backdrop-blur-xl bg-white/80 dark:bg-[#0d1117]/80 shadow-lg border border-[#d0d7de]/40 dark:border-[#30363d]/40 overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        />

        {/* Accent glow — animated on scroll */}
        <motion.div
          animate={{
            opacity: scrolled ? 0.4 : 0,
            x: scrolled ? ['-20%', '120%'] : '0%',
          }}
          transition={{
            opacity: { duration: 0.3 },
            x: { duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
          }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        >
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0969da]/20 via-[#2f81f7]/10 to-transparent blur-2xl" />
        </motion.div>

        {/* Solid background — visible when not scrolled */}
        <motion.div
          animate={{ opacity: scrolled ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-white dark:bg-[#0d1117] border-b border-[#d0d7de] dark:border-[#21262d] overflow-hidden"
          style={{ borderRadius: 'inherit' }}
        />

        <motion.div
          animate={{ paddingLeft: scrolled ? 8 : 24, paddingRight: scrolled ? 8 : 24 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative z-10 mx-auto flex items-center h-16 max-w-[1400px]"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <Logo width={28} height={28} />
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 h-full ml-10">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                label={item.label}
                href={item.href}
                active={location.pathname === item.href}
              />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden md:block w-px h-5 bg-[#d0d7de] dark:bg-[#30363d]" />

            {/* Post a skill dropdown */}
            <Dropdown
              trigger={
                <span className="text-xs font-semibold tracking-wider uppercase text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors">
                  Skills
                </span>
              }
            >
              <DropdownItem href="/listings/new">Post a Skill</DropdownItem>
              <DropdownItem href="/listings">Browse Listings</DropdownItem>
              <DropdownItem href="/explore">Discover Students</DropdownItem>
            </Dropdown>

            {/* Theme toggle */}
            <button
              onClick={() => {
                const next = !document.documentElement.classList.contains('dark')
                document.documentElement.classList.toggle('dark', next)
                localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
              }}
              className="relative p-2 rounded-xl transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer"
            >
              <div className="relative w-[18px] h-[18px]">
                <HiOutlineSun className="w-[18px] h-[18px]" />
                <div className="absolute inset-0 flex items-center justify-center transition-opacity dark:opacity-100 opacity-0">
                  <div className="w-[22px] h-[1.5px] bg-current rotate-45 rounded-full" />
                </div>
              </div>
            </button>

            {isAuthenticated ? (
              <Dropdown trigger={<Avatar name="A" size="md" showStatus />} showChevron={false}>
                <DropdownItem href="/profile">My Profile</DropdownItem>
                <DropdownItem href="/settings">Settings</DropdownItem>
                <DropdownItem>Sign Out</DropdownItem>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="sm">Sign In</Button>
              </Link>
            )}
          </div>
        </motion.div>
      </motion.header>
    </div>
  )
}
