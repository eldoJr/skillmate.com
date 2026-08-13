import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamationTriangle, HiOutlineInformationCircle, HiOutlineXMark } from 'react-icons/hi2'
import { clsx } from 'clsx'

// ── Types ──────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

// ── Context ────────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ── Single Toast Item ──────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ReactNode> = {
  success: <HiOutlineCheckCircle className="w-[18px] h-[18px] shrink-0" />,
  error:   <HiOutlineXCircle className="w-[18px] h-[18px] shrink-0" />,
  warning: <HiOutlineExclamationTriangle className="w-[18px] h-[18px] shrink-0" />,
  info:    <HiOutlineInformationCircle className="w-[18px] h-[18px] shrink-0" />,
}

const styles: Record<ToastType, string> = {
  success: 'text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#0d2119] border-[#aceebb] dark:border-[#1a4428]',
  error:   'text-[#d1242f] dark:text-[#f85149] bg-[#fff0ee] dark:bg-[#2d1216] border-[#ffcecb] dark:border-[#3d1c1e]',
  warning: 'text-[#9a6700] dark:text-[#d29922] bg-[#fff8c5] dark:bg-[#272115] border-[#f0d080] dark:border-[#3d2f0a]',
  info:    'text-[#0969da] dark:text-[#2f81f7] bg-[#ddf4ff] dark:bg-[#0c1d2e] border-[#aad4f5] dark:border-[#1a3550]',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const progressRef = useRef<HTMLDivElement>(null)
  const duration = toast.duration ?? 4000

  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    el.style.transition = `width ${duration}ms linear`
    requestAnimationFrame(() => { el.style.width = '0%' })
  }, [duration])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={clsx(
        'relative w-[340px] max-w-[calc(100vw-32px)] rounded-xl border overflow-hidden',
        'shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        styles[toast.type],
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="mt-px">{icons[toast.type]}</span>
        <p className="flex-1 text-[13px] font-medium leading-snug">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="mt-px opacity-50 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        >
          <HiOutlineXMark className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-current opacity-20">
        <div ref={progressRef} className="h-full bg-current opacity-60 w-full" />
      </div>
    </motion.div>
  )
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }])
    setTimeout(() => remove(id), duration)
  }, [remove])

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, 'success'),
    error:   (m) => toast(m, 'error'),
    warning: (m) => toast(m, 'warning'),
    info:    (m) => toast(m, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <div key={t.id} className="pointer-events-auto">
                <ToastItem toast={t} onRemove={remove} />
              </div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
