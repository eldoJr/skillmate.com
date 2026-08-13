import { clsx } from 'clsx'
import { HiOutlineXMark } from 'react-icons/hi2'

export const categories = [
  'Programming', 'Design', 'Writing', 'Tutoring',
  'Video Editing', 'Music', 'Data Analysis',
  'Digital Marketing', 'Photography', 'Translation', 'Other',
]

export const skillTags = [
  'React', 'TypeScript', 'Python', 'Figma', 'UI/UX', 'Node.js',
  'SQL', 'Excel', 'Illustrator', 'Premiere', 'After Effects',
  'Ableton', 'Writing', 'Research', 'Proofreading', 'Vue', 'Django',
  'Flutter', 'Kotlin', 'Swift', 'Rust', 'Go', 'Docker',
]

export interface ListingFormValues {
  title: string
  category: string
  description: string
  price: string
  listing_type: string
  delivery_days: string
}

const inputCls = [
  'w-full px-3 py-2 font-mono text-[11px] tracking-wide',
  'bg-white dark:bg-[#0d1117]',
  'border border-[#e2e4e8] dark:border-[#1e2228]',
  'text-[#1f2328] dark:text-[#e6edf3]',
  'placeholder-[#adb5bd] dark:placeholder-[#4a5568]',
  'outline-none focus:border-[#e8490f] dark:focus:border-[#ff6b35]',
  'transition-colors duration-150',
].join(' ')

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
      <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">{label}</span>
    </div>
  )
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase flex items-center gap-1">
        {label}
        {required && <span className="text-[#e8490f] dark:text-[#ff6b35]">*</span>}
      </label>
      {children}
      {hint && <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">{hint}</p>}
    </div>
  )
}

interface Props {
  values: ListingFormValues
  selectedTags: string[]
  loading: boolean
  error: string
  submitLabel: string
  onChange: (k: keyof ListingFormValues, v: string) => void
  onTagToggle: (tag: string) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export default function ListingForm({
  values, selectedTags, loading, error, submitLabel,
  onChange, onTagToggle, onSubmit, onCancel,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {error && (
        <div className="px-4 py-3 border border-[#f8514926] bg-[#fff0ee] dark:bg-[#2d1216] font-mono text-[10px] text-[#d1242f] dark:text-[#f85149]">
          <span className="text-[#d1242f] dark:text-[#f85149] mr-1">!</span>{error}
        </div>
      )}

      {/* Basic info */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <SectionHeader label="basic info" />
        <div className="p-4 space-y-4">
          <Field label="title" required>
            <input
              type="text"
              required
              placeholder="e.g. React & TypeScript Development"
              value={values.title}
              onChange={(e) => onChange('title', e.target.value)}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="category" required>
              <select
                required
                value={values.category}
                onChange={(e) => onChange('category', e.target.value)}
                className={clsx(inputCls, 'appearance-none cursor-pointer')}
              >
                <option value="" disabled>select…</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="type">
              <select
                value={values.listing_type}
                onChange={(e) => onChange('listing_type', e.target.value)}
                className={clsx(inputCls, 'appearance-none cursor-pointer')}
              >
                <option value="service">service</option>
                <option value="tutoring">tutoring</option>
                <option value="project">project</option>
              </select>
            </Field>
          </div>

          <Field label="description" required hint="describe what you offer, your experience, and what clients can expect">
            <textarea
              rows={5}
              required
              placeholder="I specialize in building modern web apps with React and TypeScript…"
              value={values.description}
              onChange={(e) => onChange('description', e.target.value)}
              className={clsx(inputCls, 'resize-none leading-relaxed')}
            />
          </Field>
        </div>
      </div>

      {/* Pricing */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <SectionHeader label="pricing & delivery" />
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="hourly rate (R)" hint="leave blank for negotiable">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[#636c76] dark:text-[#848d97] pointer-events-none">R</span>
                <input
                  type="number"
                  min="0"
                  placeholder="150"
                  value={values.price}
                  onChange={(e) => onChange('price', e.target.value)}
                  className={clsx(inputCls, 'pl-7')}
                />
              </div>
            </Field>
            <Field label="delivery (days)" hint="estimated turnaround">
              <input
                type="number"
                min="1"
                placeholder="3"
                value={values.delivery_days}
                onChange={(e) => onChange('delivery_days', e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <SectionHeader label="skills & tags" />
        <div className="p-4 space-y-3">
          <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97]">
            select tags that best describe your skills
            {selectedTags.length > 0 && (
              <span className="ml-2 text-[#e8490f] dark:text-[#ff6b35]">· {selectedTags.length} selected</span>
            )}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skillTags.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 font-mono text-[9px] tracking-wide border transition-all duration-150 cursor-pointer',
                    active
                      ? 'bg-[#e8490f] dark:bg-[#ff6b35] text-white border-[#e8490f] dark:border-[#ff6b35]'
                      : 'bg-transparent text-[#636c76] dark:text-[#848d97] border-[#e2e4e8] dark:border-[#1e2228] hover:border-[#e8490f] dark:hover:border-[#ff6b35] hover:text-[#e8490f] dark:hover:text-[#ff6b35]',
                  )}
                >
                  {active && <HiOutlineXMark className="w-2.5 h-2.5" />}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 font-mono text-[10px] tracking-wide border border-[#e2e4e8] dark:border-[#1e2228] text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] hover:border-[#636c76] dark:hover:border-[#848d97] transition-colors cursor-pointer"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 font-mono text-[10px] tracking-wide bg-[#e8490f] dark:bg-[#ff6b35] text-white hover:bg-[#d03d0a] dark:hover:bg-[#e85c20] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
