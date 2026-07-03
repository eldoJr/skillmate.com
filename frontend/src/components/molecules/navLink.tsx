import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'

interface NavLinkProps {
  label: string
  href?: string
  active?: boolean
  className?: string
  onClick?: () => void
}

export default function NavLink({ label, href = '#', active = false, className = '', onClick }: NavLinkProps) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={clsx(
        'relative px-1 py-2 text-xs font-semibold tracking-wider uppercase transition-colors',
        active
          ? 'text-[#0969da] dark:text-[#2f81f7]'
          : 'text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3]',
        className,
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0969da] dark:bg-[#2f81f7]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  )
}
