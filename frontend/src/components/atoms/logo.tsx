interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export default function Logo({ className = '', width = 32, height = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/ico.svg" alt="Skillmate" width={width} height={height} />
      <span className="font-bold text-[15px] text-[#1f2328] dark:text-[#e6edf3] tracking-tight">
        skillmate
      </span>
    </div>
  )
}
