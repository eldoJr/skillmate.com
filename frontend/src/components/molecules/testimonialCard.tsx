import { clsx } from 'clsx'

interface TestimonialCardProps {
  name: string
  handle: string
  image: string
  description: string
  className?: string
}

export default function TestimonialCard({ name, handle, image, description, className = '' }: TestimonialCardProps) {
  return (
    <div
      className={clsx(
        'mx-2 flex h-32 w-80 shrink-0 cursor-pointer overflow-hidden rounded-xl',
        'bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-3',
        'hover:border-[#0969da]/50 dark:hover:border-[#2f81f7]/50 hover:shadow-md',
        'transition-all duration-300',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#d0d7de] dark:border-[#30363d]">
          <img src={image} alt={name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-[#1f2328] dark:text-[#e6edf3]">{name}</span>
            <span className="text-xs text-[#636c76] dark:text-[#848d97]">{handle}</span>
          </div>
          <p className="mt-1 line-clamp-3 text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
