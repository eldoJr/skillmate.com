import { motion } from 'framer-motion'
import { HiUserPlus, HiMagnifyingGlass, HiRocketLaunch } from 'react-icons/hi2'

const steps = [
  {
    icon: HiUserPlus,
    title: 'Create Your Profile',
    description: 'Verify with your university email and meet your AI career companion. Your roadmap starts immediately.',
  },
  {
    icon: HiMagnifyingGlass,
    title: 'Discover Opportunities',
    description: 'Receive AI-matched projects, internships, and freelance work ranked by your profile.',
  },
  {
    icon: HiRocketLaunch,
    title: 'Deliver, Grow, Repeat',
    description: 'Complete work, earn reviews, and your portfolio and resume update themselves.',
  },
]

export default function HowItWorks() {
  return (
    <section className="w-full max-w-[1250px] mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="text-sm font-bold text-[#0969da] dark:text-[#2f81f7] tracking-wide">How It Works</span>
        <h2 className="text-3xl md:text-4xl font-bold text-[#1f2328] dark:text-[#e6edf3] mt-3">
          From sign up to first opportunity in three steps
        </h2>
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-[#d0d7de] via-[#0969da] to-[#d0d7de] dark:from-[#30363d] dark:via-[#2f81f7] dark:to-[#30363d]" />

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative z-10 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] shadow-sm flex items-center justify-center">
                <step.icon className="w-7 h-7 text-[#0969da] dark:text-[#2f81f7]" />
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0969da] dark:bg-[#2f81f7] text-white text-xs font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#1f2328] dark:text-[#e6edf3] mb-2">{step.title}</h3>
            <p className="text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed max-w-xs">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
