import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  loading: boolean
}

export default function ProgressBar({ loading }: Props) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (loading) {
      clearTimeout(timeout.current!)
      setProgress(0)
      setVisible(true)
      setProgress(15)
      interval.current = setInterval(() => {
        setProgress(p => {
          if (p >= 85) { clearInterval(interval.current!); return p }
          const increment = p < 40 ? 8 : p < 65 ? 4 : 1.5
          return Math.min(p + increment, 85)
        })
      }, 300)
    } else {
      clearInterval(interval.current!)
      setVisible(v => {
        if (v) {
          setProgress(100)
          timeout.current = setTimeout(() => setVisible(false), 500)
        }
        return v
      })
    }

    return () => {
      clearInterval(interval.current!)
      clearTimeout(timeout.current!)
    }
  }, [loading])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="h-full bg-[#0969da] dark:bg-[#2f81f7] origin-left"
            style={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: progress === 100 ? 0.25 : 0.6 }}
          />
          {/* Glow tip */}
          <motion.div
            className="absolute top-0 right-0 h-[2.5px] w-24 bg-gradient-to-l from-transparent via-[#0969da]/60 dark:via-[#2f81f7]/60 to-transparent blur-[2px]"
            style={{ right: `${100 - progress}%` }}
            animate={{ right: `${100 - progress}%` }}
            transition={{ ease: [0.25, 0.1, 0.25, 1], duration: progress === 100 ? 0.25 : 0.6 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
