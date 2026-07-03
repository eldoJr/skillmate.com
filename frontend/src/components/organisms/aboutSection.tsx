import { motion } from 'framer-motion'
import { HiAcademicCap, HiStar, HiChatBubbleLeftRight, HiShieldCheck } from 'react-icons/hi2'

const features = [
  {
    icon: <HiAcademicCap className="w-6 h-6" />,
    title: 'Verified Students Only',
    description: 'Every account is verified through an institutional email, ensuring a trusted and safe environment for all exchanges.',
  },
  {
    icon: <HiStar className="w-6 h-6" />,
    title: 'Skill-Based Marketplace',
    description: 'Browse and offer services by category — from programming and design to tutoring and music. Your skills, your terms.',
  },
  {
    icon: <HiChatBubbleLeftRight className="w-6 h-6" />,
    title: 'Direct Collaboration',
    description: 'Message peers in real time, negotiate terms, and collaborate without leaving the platform.',
  },
  {
    icon: <HiShieldCheck className="w-6 h-6" />,
    title: 'Reputation System',
    description: 'Build credibility through ratings and reviews. The more you deliver, the stronger your profile becomes.',
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
          <span className="font-light"> is the platform where university students turn their skills into real opportunities.</span>
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
