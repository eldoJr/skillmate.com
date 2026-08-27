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
  'bg-canvas-overlay dark:bg-canvas-dark-inset',
  'border border-border-default dark:border-border-dark-default',
  'text-fg-default dark:text-fg-dark-default',
  'placeholder-fg-subtle dark:placeholder-fg-dark-subtle',
  'outline-none focus:border-brand dark:focus:border-brand-dark-DEFAULT',
  'transition-colors duration-150',
].join(' ')

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-dark-DEFAULT" />
      <span className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase">{label}</span>
    </div>
  )
}

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[9px] tracking-widest text-fg-muted dark:text-fg-dark-muted uppercase flex items-center gap-1">
        {label}
        {required && <span className="text-danger-fg dark:text-danger-dark-fg">*</span>}
      </label>
      {children}
      {hint && <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">{hint}</p>}
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
        <div className="px-4 py-3 border border-danger-muted dark:border-danger-dark-muted bg-danger-subtle dark:bg-danger-dark-subtle font-mono text-[10px] text-danger-fg dark:text-danger-dark-fg">
          <span className="mr-1">!</span>{error}
        </div>
      )}

      {/* Basic info */}
      <div className="border border-border-default dark:border-border-dark-default">
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
      <div className="border border-border-default dark:border-border-dark-default">
        <SectionHeader label="pricing & delivery" />
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="hourly rate (R)" hint="leave blank for negotiable">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-fg-muted dark:text-fg-dark-muted pointer-events-none">R</span>
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
      <div className="border border-border-default dark:border-border-dark-default">
        <SectionHeader label="skills & tags" />
        <div className="p-4 space-y-3">
          <p className="font-mono text-[9px] text-fg-muted dark:text-fg-dark-muted">
            select tags that best describe your skills
            {selectedTags.length > 0 && (
              <span className="ml-2 text-brand dark:text-brand-dark-DEFAULT">· {selectedTags.length} selected</span>
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
                      ? 'bg-brand dark:bg-brand-dark-DEFAULT text-white border-brand dark:border-brand-dark-DEFAULT'
                      : 'bg-transparent text-fg-muted dark:text-fg-dark-muted border-border-default dark:border-border-dark-default hover:border-brand dark:hover:border-brand-dark-DEFAULT hover:text-brand dark:hover:text-brand-dark-DEFAULT',
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
          className="px-4 py-2 font-mono text-[10px] tracking-wide border border-border-default dark:border-border-dark-default text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:border-fg-muted dark:hover:border-fg-dark-muted transition-colors cursor-pointer"
        >
          cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 font-mono text-[10px] tracking-wide bg-brand dark:bg-brand-dark-DEFAULT text-white hover:bg-brand-hover dark:hover:bg-brand-dark-hover transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
