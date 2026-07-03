import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { type ReactNode } from 'react'

interface BentoCardProps {
  title: string
  description: string
  visual?: ReactNode
  className?: string
  index?: number
}

export default function BentoCard({ title, description, visual, className = '', index = 0 }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className={clsx(
        'group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col',
        'bg-white dark:bg-[#161b22]',
        'border border-[#d0d7de] dark:border-[#30363d]',
        'shadow-sm hover:shadow-md hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40',
        'transition-all duration-300',
        className,
      )}
    >
      {visual && (
        <div className="relative w-full h-36 sm:h-44 flex items-center justify-center px-6 pt-6 overflow-hidden">
          {visual}
        </div>
      )}
      <div className="px-6 pb-6 pt-5 mt-auto">
        <h3 className="text-base font-bold text-[#1f2328] dark:text-[#e6edf3] mb-2 flex items-center gap-3">
          <span className="inline-block w-[3px] h-5 rounded-full bg-[#0969da] dark:bg-[#2f81f7] shrink-0" />
          {title}
        </h3>
        <p className="text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}
