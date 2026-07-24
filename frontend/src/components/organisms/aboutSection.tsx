import { motion } from 'framer-motion'
import { HiSparkles, HiStar, HiChatBubbleLeftRight, HiShieldCheck } from 'react-icons/hi2'

const features = [
  {
    icon: <HiSparkles className="w-6 h-6" />,
    title: 'AI Career Companion',
    description: 'Your personal AI mentor guides you with advice, roadmaps, and opportunities tailored to your goals.',
  },
  {
    icon: <HiStar className="w-6 h-6" />,
    title: 'Living Professional Profile',
    description: 'Every project, review, and certification builds a professional identity that grows automatically.',
  },
  {
    icon: <HiChatBubbleLeftRight className="w-6 h-6" />,
    title: 'Real Opportunities',
    description: 'Freelance projects, internships, and hackathons ranked daily by compatibility with your profile.',
  },
  {
    icon: <HiShieldCheck className="w-6 h-6" />,
    title: 'Trusted Ecosystem',
    description: 'Verified via university email. Reputation scores track delivery, communication, and growth.',,
  },
]

export default function AboutSection() {
  return (
    <section className="w-full max-w-[1250px] mx-auto px-6 py-20">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <span className="text-sm font-bold text-[#0969da] dark:text-[#2f81f7] tracking-wide">
          What is Skillmate?
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl text-[#1f2328] dark:text-[#e6edf3] mt-3 max-w-3xl leading-tight">
          <span className="font-bold">Skillmate</span>
          <span className="font-light"> is the intelligent career ecosystem where students turn skills into opportunities before graduation.</span>
        </h2>
      </motion.div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="group flex flex-col gap-4 rounded-2xl p-6 cursor-pointer bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] shadow-sm hover:shadow-md hover:border-[#0969da]/40 dark:hover:border-[#2f81f7]/40 transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#ddf4ff] dark:bg-[#121d2f] flex items-center justify-center text-[#0969da] dark:text-[#2f81f7] group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold text-[#1f2328] dark:text-[#e6edf3]">
              {feature.title}
            </h3>
            <p className="text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

    </section>
  )
}
