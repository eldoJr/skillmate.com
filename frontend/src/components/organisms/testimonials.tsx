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
  { name: 'Aisha Kamara', handle: '@aishak', image: 'https://i.pravatar.cc/100?img=1', description: 'Found a React developer within my university in 24 hours. Skillmate is exactly what students needed.' },
  { name: 'Tomas Silva', handle: '@tomassilva', image: 'https://i.pravatar.cc/100?img=3', description: 'I tutored 5 students last semester through Skillmate and built a real portfolio doing it.' },
  { name: 'Priya Nair', handle: '@priyanair', image: 'https://i.pravatar.cc/100?img=5', description: 'The verification system makes it feel safe. I know I\'m dealing with real students, not strangers.' },
  { name: 'James Osei', handle: '@jamesosei', image: 'https://i.pravatar.cc/100?img=8', description: 'Got my logo designed by a design student for a fair price. The quality was outstanding.' },
  { name: 'Lena Müller', handle: '@lenamuller', image: 'https://i.pravatar.cc/100?img=9', description: 'As a writing student, Skillmate gave me real clients before I even graduated.' },
  { name: 'Kwame Asante', handle: '@kwameasante', image: 'https://i.pravatar.cc/100?img=11', description: 'The rating system keeps everyone accountable. Best peer marketplace I\'ve used.' },
  { name: 'Sofia Reyes', handle: '@sofiareyes', image: 'https://i.pravatar.cc/100?img=16', description: 'I exchanged video editing for Python tutoring. No money needed — just skills.' },
  { name: 'Ravi Patel', handle: '@ravipatel', image: 'https://i.pravatar.cc/100?img=12', description: 'My Skillmate profile helped me land a freelance gig outside university too. Game changer.' },
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
            Loved by students
          </h2>
          <p className="text-[#636c76] dark:text-[#848d97] text-lg max-w-lg mx-auto">
            See what the Skillmate community has to say.
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
