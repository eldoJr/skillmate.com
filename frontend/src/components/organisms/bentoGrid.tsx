import { motion } from 'framer-motion'
import {
  HiCodeBracket,
  HiStar,
  HiUserGroup,
  HiGlobeAlt,
  HiSparkles,
  HiRocketLaunch,
} from 'react-icons/hi2'
import BentoCard from '../molecules/bentoCard'

const features = [
  {
    title: 'Skill Listings',
    description: 'Post or browse services by category — programming, design, writing, tutoring, and more.',
    visual: (
      <div className="flex flex-wrap gap-2">
        {['React', 'Figma', 'Python', 'Writing', 'Music', 'Data'].map((tag) => (
          <span key={tag} className="px-3 py-1.5 text-xs font-medium rounded-full border border-[#d0d7de] dark:border-[#30363d] text-[#636c76] dark:text-[#848d97] bg-[#f6f8fa] dark:bg-[#0d1117]">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  {
    title: 'Verified Identity',
    description: 'Every student verified through their university email.',
    visual: (
      <div className="flex items-center justify-center gap-4">
        {[HiCodeBracket, HiStar, HiSparkles].map((Icon, i) => (
          <div key={i} className="w-10 h-10 rounded-xl bg-[#ddf4ff] dark:bg-[#121d2f] flex items-center justify-center text-[#0969da] dark:text-[#2f81f7]">
            <Icon className="w-5 h-5" />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Peer Network',
    description: 'Connect with students across departments and universities.',
    visual: (
      <div className="grid grid-cols-3 gap-3">
        {[HiUserGroup, HiGlobeAlt, HiCodeBracket, HiSparkles, HiStar, HiRocketLaunch].map((Icon, i) => (
          <div key={i} className="w-9 h-9 rounded-lg bg-[#f6f8fa] dark:bg-[#21262d] flex items-center justify-center text-[#636c76] dark:text-[#848d97]">
            <Icon className="w-4 h-4" />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Multi-University',
    description: 'Find talent or clients beyond your own campus.',
    visual: (
      <div className="flex flex-col gap-2 w-full">
        {['UCT', 'Wits', 'Stellenbosch', 'UP'].map((uni) => (
          <div key={uni} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0969da] dark:bg-[#2f81f7]" />
            <span className="text-xs text-[#636c76] dark:text-[#848d97]">{uni}</span>
            <div className="flex-1 h-px bg-[#d0d7de] dark:bg-[#30363d]" />
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'AI Skill Matching',
    description: 'Matched by experience, portfolio quality, availability, and compatibility — not just keywords.',
    visual: (
      <div className="flex items-center gap-2 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-lg px-4 py-3 w-full border border-[#d0d7de] dark:border-[#30363d]">
        <span className="text-xs text-[#636c76] dark:text-[#848d97] font-mono">$ match --skill react</span>
        <span className="w-px h-4 bg-[#0969da] dark:bg-[#2f81f7] animate-pulse" />
      </div>
    ),
  },
  {
    title: 'Career Momentum',
    description: 'Portfolio, resume, and reputation update automatically after every completed project.',
    visual: (
      <div className="flex flex-col items-start w-full">
        <span className="text-4xl font-black text-[#1f2328] dark:text-[#e6edf3]">2.4K+</span>
        <div className="w-full h-12 mt-2">
          <svg viewBox="0 0 200 40" className="w-full h-full">
            <path d="M0 35 Q50 30 80 20 T160 8 T200 2" fill="none" stroke="#0969da" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    ),
  },
]

export default function BentoGrid() {
  return (
    <section className="w-full bg-[#f6f8fa] dark:bg-[#161b22]">
      <div className="max-w-[1250px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <span className="text-sm font-bold text-[#0969da] dark:text-[#2f81f7] tracking-wide">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1f2328] dark:text-[#e6edf3] mt-3">
            Everything you need to build your career
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
          {features.map((feature, i) => {
            const spans = ['sm:col-span-2 md:col-span-5', 'sm:col-span-1 md:col-span-3', 'sm:col-span-1 md:col-span-4', 'sm:col-span-1 md:col-span-4', 'sm:col-span-1 md:col-span-5', 'sm:col-span-1 md:col-span-3']
            return (
              <BentoCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                visual={feature.visual}
                index={i}
                className={`h-full ${spans[i]}`}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
