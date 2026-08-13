import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineArrowLeft, HiOutlineHome } from 'react-icons/hi2'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0d1117] flex items-center justify-center px-6 z-40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Graphic */}
        <div className="relative mb-8 select-none">
          {/* Background glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0969da]/10 to-[#8250df]/10 blur-3xl scale-150" />

          {/* 404 number */}
          <div className="relative flex items-end gap-1 leading-none">
            <span className="text-[96px] font-black text-[#d0d7de] dark:text-[#21262d] tracking-tighter select-none">
              4
            </span>
            {/* Logo O */}
            <div className="w-[72px] h-[72px] mb-3 rounded-2xl bg-gradient-to-br from-[#0969da] to-[#8250df] flex items-center justify-center shadow-xl shadow-[#0969da]/20 dark:shadow-[#0969da]/10 shrink-0">
              <span className="text-white font-black text-[32px] tracking-tight">S</span>
            </div>
            <span className="text-[96px] font-black text-[#d0d7de] dark:text-[#21262d] tracking-tighter select-none">
              4
            </span>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-[20px] font-bold text-[#1f2328] dark:text-[#e6edf3] mb-2">
          Page not found
        </h1>
        <p className="text-[13px] text-[#636c76] dark:text-[#848d97] leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors cursor-pointer"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer"
          >
            <HiOutlineHome className="w-4 h-4" />
            Dashboard
          </button>
        </div>

        {/* Subtle footer */}
        <p className="mt-10 text-[11px] text-[#d0d7de] dark:text-[#30363d]">
          skillmate.com
        </p>
      </motion.div>
    </div>
  )
}
