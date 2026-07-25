import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineXMark } from 'react-icons/hi2'
import Button from '../../components/atoms/button'
import { listingsService } from '../../services/listings'

const categories = ['Programming', 'Design', 'Writing', 'Tutoring', 'Video Editing', 'Music', 'Data Analysis', 'Digital Marketing', 'Photography', 'Translation', 'Other']
const skillTags = ['React', 'TypeScript', 'Python', 'Figma', 'UI/UX', 'Node.js', 'SQL', 'Excel', 'Illustrator', 'Premiere', 'After Effects', 'Ableton', 'Writing', 'Research', 'Proofreading']

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#e6edf3] placeholder-[#636c76] dark:placeholder-[#848d97] outline-none focus:border-[#0969da] dark:focus:border-[#2f81f7] focus:bg-white dark:focus:bg-[#0d1117] transition-all'

export default function NewListingPage() {
  const navigate = useNavigate()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '', category: '', description: '',
    price: '', listing_type: 'service', delivery_days: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await listingsService.create({
        title: form.title,
        description: form.description,
        category: form.category,
        listing_type: form.listing_type,
        price: form.price ? parseFloat(form.price) : null,
        delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
        skill_ids: [],
      })
      navigate('/app/listings')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Failed to create listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">Create a New Listing</h2>
        <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">Describe the skill or service you're offering to other students.</p>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-[#fff0ee] dark:bg-[#2d1216] border border-[#ffcecb] dark:border-[#f8514926] text-[#d1242f] dark:text-[#f85149] text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Basic Info</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Listing title</label>
            <input type="text" placeholder="e.g. React & TypeScript Development" required value={form.title} onChange={set('title')} className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Category</label>
            <select required value={form.category} onChange={set('category')} className={`${inputCls} appearance-none`}>
              <option value="" disabled>Select a category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Description</label>
            <textarea
              rows={4}
              placeholder="Describe what you offer, your experience, and what clients can expect…"
              required
              value={form.description}
              onChange={set('description')}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Pricing & Availability</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Price (R)</label>
              <input type="number" min="0" placeholder="e.g. 150" value={form.price} onChange={set('price')} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Type</label>
              <select value={form.listing_type} onChange={set('listing_type')} className={`${inputCls} appearance-none`}>
                <option value="service">Service</option>
                <option value="tutoring">Tutoring</option>
                <option value="project">Project</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Delivery time (days)</label>
            <input type="number" min="1" placeholder="e.g. 3" value={form.delivery_days} onChange={set('delivery_days')} className={inputCls} />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[#1f2328] dark:text-[#e6edf3]">Skills & Tags</h3>
          <p className="text-[11px] text-[#636c76] dark:text-[#848d97] -mt-2">Select tags that describe your skills.</p>
          <div className="flex flex-wrap gap-2">
            {skillTags.map((tag) => {
              const active = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0969da] dark:bg-[#2f81f7] text-white border-[#0969da] dark:border-[#2f81f7]'
                      : 'bg-white dark:bg-[#0d1117] text-[#636c76] dark:text-[#848d97] border-[#d0d7de] dark:border-[#30363d] hover:border-[#0969da] dark:hover:border-[#2f81f7] hover:text-[#0969da] dark:hover:text-[#2f81f7]'
                  }`}
                >
                  {active && <HiOutlineXMark className="w-3 h-3" />}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <button type="button" onClick={() => navigate('/app/listings')} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] transition-colors cursor-pointer">
            Cancel
          </button>
          <Button size="md" className="rounded-xl px-6" disabled={loading}>
            {loading ? 'Publishing…' : 'Publish Listing'}
          </Button>
        </div>
      </form>
    </div>
  )
}
