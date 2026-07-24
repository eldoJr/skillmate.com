import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import TestimonialCard from '../molecules/testimonialCard'

interface ScrollRowProps {
  children: ReactNode
  reverse?: boolean
  pauseOnHover?: boolean
  repeat?: number
  className?: string
}

function ScrollRow({ children, reverse = false, pauseOnHover = true, repeat = 3, className = '' }: ScrollRowProps) {
  return (
    <div className={clsx('pause-on-hover relative flex w-full overflow-hidden [--gap:12px] [--duration:30s]', className)}>
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'flex shrink-0 gap-[--gap]',
            reverse ? 'animate-scroll-right' : 'animate-scroll-left',
            pauseOnHover && 'scroll-animated',
          )}
          style={{ animationPlayState: 'running' }}
        >
          {children}
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#f6f8fa] via-transparent to-[#f6f8fa] dark:from-[#161b22] dark:via-transparent dark:to-[#161b22]" />
    </div>
  )
}

const testimonials = [
  { name: 'Aisha Kamara', handle: '@aishak', image: 'https://i.pravatar.cc/100?img=1', description: 'Found a React developer within my university in 24 hours. The AI matched us perfectly based on my project requirements.' },
  { name: 'Tomas Silva', handle: '@tomassilva', image: 'https://i.pravatar.cc/100?img=3', description: 'I tutored 5 students last semester and Skillmate automatically built my portfolio from every session. I had a professional CV before I even graduated.' },
  { name: 'Priya Nair', handle: '@priyanair', image: 'https://i.pravatar.cc/100?img=5', description: 'The AI mentor told me exactly which skills to learn next based on what companies in my region were hiring for. That advice was worth everything.' },
  { name: 'James Osei', handle: '@jamesosei', image: 'https://i.pravatar.cc/100?img=8', description: 'Got my logo designed by a design student for a fair price. The AI-generated proposal made the whole process smooth and professional.' },
  { name: 'Lena Müller', handle: '@lenamuller', image: 'https://i.pravatar.cc/100?img=9', description: 'As a writing student, Skillmate surfaced freelance clients I never would have found on my own. I earned my first income before finishing my degree.' },
  { name: 'Kwame Asante', handle: '@kwameasante', image: 'https://i.pravatar.cc/100?img=11', description: 'The reputation scores go beyond star ratings. Clients can see my delivery consistency and communication history. It builds real trust.' },
  { name: 'Sofia Reyes', handle: '@sofiareyes', image: 'https://i.pravatar.cc/100?img=16', description: 'The AI pricing advisor told me I was undercharging by 40%. I adjusted my rates and landed better clients within a week.' },
  { name: 'Ravi Patel', handle: '@ravipatel', image: 'https://i.pravatar.cc/100?img=12', description: 'My Skillmate career timeline showed every milestone I had hit. I shared it with a recruiter and got an internship interview the same day.' },
]

export default function Testimonials() {
  return (
    <section className="w-full bg-[#f6f8fa] dark:bg-[#161b22]">
      <div className="max-w-[1250px] mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-bold text-[#0969da] dark:text-[#2f81f7] tracking-wide">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1f2328] dark:text-[#e6edf3] mt-3 mb-3">
            Students who started before graduation
          </h2>
          <p className="text-[#636c76] dark:text-[#848d97] text-lg max-w-lg mx-auto">
            Real stories from the Skillmate community.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          <ScrollRow>
            {testimonials.slice(0, 4).map((t) => <TestimonialCard key={t.handle} {...t} />)}
          </ScrollRow>
          <ScrollRow reverse>
            {testimonials.slice(4).map((t) => <TestimonialCard key={t.handle} {...t} />)}
          </ScrollRow>
          <ScrollRow>
            {[...testimonials].reverse().slice(0, 4).map((t) => <TestimonialCard key={t.handle + '-3'} {...t} />)}
          </ScrollRow>
        </div>
      </div>
    </section>
  )
}
