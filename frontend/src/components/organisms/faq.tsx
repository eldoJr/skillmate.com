import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown } from 'react-icons/hi2'
import { clsx } from 'clsx'

const faqs = [
  {
    q: 'Is Skillmate free to use?',
    a: 'Yes. Creating a profile, browsing listings, and accessing your AI career companion is completely free for all students. Optional premium features may be introduced in the future.',
  },
  {
    q: 'Who can join Skillmate?',
    a: 'Any university student with a valid institutional email address. Every account is verified to ensure a trusted community where students can work with confidence.',
  },
  {
    q: 'What does the AI actually do?',
    a: 'The AI acts as a personal career companion. It builds your roadmap, recommends opportunities ranked by compatibility, generates proposals, updates your portfolio and resume automatically, and advises on pricing and skill gaps.',
  },
  {
    q: 'Can I both offer and find work on Skillmate?',
    a: 'Absolutely. You can post your own skill listings and receive AI-matched project opportunities at the same time, all within a single account.',
  },
  {
    q: 'How does the reputation system work?',
    a: 'Skillmate measures more than star ratings. Your Reliability Score, Professionalism Score, and Growth Score evolve over time based on delivery consistency, communication, and client satisfaction.',
  },
  {
    q: 'What happens after I complete a project?',
    a: 'The platform automatically requests client feedback, updates your portfolio with a polished entry, refreshes your resume, awards badges, and recalculates your market value. Nothing important is forgotten.',
  },
]

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={clsx(
      'rounded-2xl border transition-colors duration-200',
      open
        ? 'border-[#0969da]/30 dark:border-[#2f81f7]/30 bg-[#ddf4ff]/30 dark:bg-[#121d2f]/50'
        : 'border-[#d0d7de] dark:border-[#30363d] bg-transparent',
    )}>
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer">
        <span className="text-sm font-semibold text-[#1f2328] dark:text-[#e6edf3]">{q}</span>
        <HiChevronDown className={clsx('w-5 h-5 shrink-0 text-[#636c76] dark:text-[#848d97] transition-transform duration-200', open && 'rotate-180 text-[#0969da] dark:text-[#2f81f7]')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="w-full bg-white dark:bg-[#0d1117]">
      <div className="max-w-[1250px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-bold text-[#0969da] dark:text-[#2f81f7] tracking-wide">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1f2328] dark:text-[#e6edf3] mt-3">
            Questions? We have answers.
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <FaqItem q={faq.q} a={faq.a} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
