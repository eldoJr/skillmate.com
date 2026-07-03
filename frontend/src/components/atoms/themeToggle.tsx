import { HiOutlineSun } from 'react-icons/hi2'

export default function ThemeToggle() {
  return (
    <button
      onClick={() => {
        const next = !document.documentElement.classList.contains('dark')
        document.documentElement.classList.toggle('dark', next)
        localStorage.setItem('skillmate_theme', next ? 'dark' : 'light')
      }}
      className="p-2 rounded-xl transition-colors text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3] cursor-pointer"
    >
      <div className="relative w-[18px] h-[18px]">
        <HiOutlineSun className="w-[18px] h-[18px]" />
        <div className="absolute inset-0 flex items-center justify-center transition-opacity dark:opacity-100 opacity-0">
          <div className="w-[22px] h-[1.5px] bg-current rotate-45 rounded-full" />
        </div>
      </div>
    </button>
  )
}
