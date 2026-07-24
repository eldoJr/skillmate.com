import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiMagnifyingGlass, HiArrowRight } from 'react-icons/hi2'

const avatars = [
  { initials: 'AK', color: 'bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7]' },
  { initials: 'MJ', color: 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]' },
  { initials: 'TS', color: 'bg-[#fff0ee] dark:bg-[#2d1216] text-[#d1242f] dark:text-[#f85149]' },
  { initials: 'RL', color: 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0d1117] pt-8 pb-16 sm:pb-28 px-4 sm:px-6">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#1f2328 1px, transparent 1px), linear-gradient(90deg, #1f2328 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#0969da]/8 dark:bg-[#2f81f7]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#1a7f37]/6 dark:bg-[#3fb950]/8 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-[760px] mx-auto text-center pt-12 sm:pt-20 pb-8">

        {/* Badge */}
        <motion.div
          variants={fadeUp} custom={0} initial="hidden" animate="show"
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a7f37] dark:bg-[#3fb950] animate-pulse" />
          <span className="text-[11px] font-medium text-[#636c76] dark:text-[#848d97] tracking-wide">
            Now in beta &mdash; free for all students
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp} custom={1} initial="hidden" animate="show"
          className="text-[38px] sm:text-[56px] lg:text-[72px] font-bold text-[#1f2328] dark:text-[#e6edf3] leading-[1.05] tracking-tight mb-5"
        >
          Your career starts
          <br />
          <span className="text-[#0969da] dark:text-[#2f81f7]">before graduation</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp} custom={2} initial="hidden" animate="show"
          className="text-[15px] sm:text-[17px] text-[#636c76] dark:text-[#848d97] max-w-[480px] mx-auto leading-relaxed mb-10"
        >
          Discover opportunities, earn income, and build your professional identity before graduation.
        </motion.p>

        {/* Search bar */}
        <motion.div
          variants={fadeUp} custom={3} initial="hidden" animate="show"
          className="w-full max-w-[500px] mx-auto mb-5"
        >
          <div className="flex items-center w-full overflow-hidden rounded-full bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] focus-within:border-[#0969da] dark:focus-within:border-[#2f81f7] focus-within:bg-white dark:focus-within:bg-[#0d1117] transition-all">
            <HiMagnifyingGlass className="ml-5 shrink-0 w-4 h-4 text-[#636c76] dark:text-[#848d97]" />
            <input
              type="text"
              placeholder="Search for a skill..."
              className="flex-1 min-w-0 px-3 py-3.5 sm:py-4 bg-transparent text-sm text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none"
            />
            <button className="shrink-0 self-stretch px-5 sm:px-7 bg-[#0969da] dark:bg-[#2f81f7] text-white text-sm font-semibold hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors cursor-pointer rounded-l-full">
              Search
            </button>
          </div>
        </motion.div>

        {/* CTA row */}
        <motion.div
          variants={fadeUp} custom={4} initial="hidden" animate="show"
          className="flex flex-wrap items-center justify-center gap-3 mb-12 sm:mb-14"
        >
          <Link
            to="/explore"
            className="group relative inline-flex items-center gap-2 text-sm font-medium text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors overflow-hidden"
          >
            {/* Shine sweep */}
            <motion.span
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
            />
            Browse skills
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <HiArrowRight className="w-3.5 h-3.5" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp} custom={5} initial="hidden" animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <div className="flex -space-x-2.5">
            {avatars.map((a, i) => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-white dark:border-[#0d1117] ${a.color}`}>
                {a.initials}
              </div>
            ))}
          </div>
          <p className="text-sm text-[#636c76] dark:text-[#848d97]">
            Joined by <span className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">2,400+ students</span> across 180+ universities
          </p>
        </motion.div>

      </div>
    </section>
  )
}
