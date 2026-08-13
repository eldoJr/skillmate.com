import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface LoadingProps {
  /** 'page' fills the full viewport, 'section' fills its container, 'inline' is a small spinner */
  variant?: 'page' | 'section' | 'inline'
  message?: string
}

function Spinner({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className="animate-spin"
      style={{ animationDuration: '0.75s' }}
    >
      <circle
        cx="14" cy="14" r="11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="52"
        strokeDashoffset="38"
        className="text-[#0969da] dark:text-[#2f81f7]"
      />
      <circle
        cx="14" cy="14" r="11"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-[#d0d7de] dark:text-[#30363d]"
        opacity="0.4"
      />
    </svg>
  )
}

export default function Loading({ variant = 'section', message }: LoadingProps) {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2 text-[#636c76] dark:text-[#848d97] text-[13px]">
        <Spinner size={16} />
        {message && <span>{message}</span>}
      </span>
    )
  }

  const isPage = variant === 'page'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'flex flex-col items-center justify-center gap-4',
        isPage
          ? 'fixed inset-0 bg-white dark:bg-[#0d1117] z-50'
          : 'w-full h-full min-h-[240px]',
      )}
    >
      {/* Logo mark */}
      <div className="relative">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0969da] to-[#8250df] flex items-center justify-center shadow-lg shadow-[#0969da]/20 dark:shadow-[#0969da]/10">
          <span className="text-white font-bold text-[15px] tracking-tight">S</span>
        </div>
        <div className="absolute -bottom-1 -right-1">
          <Spinner size={20} />
        </div>
      </div>

      {message && (
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97] font-medium">{message}</p>
      )}

      {/* Subtle dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-[#d0d7de] dark:bg-[#30363d]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
