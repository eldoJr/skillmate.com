import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown } from 'react-icons/hi2'
import { clsx } from 'clsx'

const faqs = [
  {
    q: 'Is Skillmate free to use?',
    a: 'Yes — creating a profile, browsing listings, and contacting students is completely free. We may introduce optional premium features in the future.',
  },
  {
    q: 'Who can join Skillmate?',
    a: 'Any university student with a valid institutional email address. We verify every account to ensure a trusted and safe community.',
  },
  {
    q: 'How does the verification work?',
    a: 'When you sign up, we send a confirmation link to your university email. Once verified, your profile gets a verified badge that builds trust with other students.',
  },
  {
    q: 'Can I both offer and request skills?',
    a: 'Absolutely. You can post your own skill listings and also browse or request services from other students — all within the same account.',
  },
  {
    q: 'How are payments handled?',
    a: 'Payment methods are agreed directly between students. Skillmate facilitates the connection — integrated payment support is on our roadmap.',
  },
  {
    q: 'What happens if there is a dispute?',
    a: 'Our ratings and reviews system encourages accountability. A formal dispute resolution process is planned as the platform scales.',
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
            Questions? We've got answers.
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
