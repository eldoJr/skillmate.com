import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import ListingForm, { type ListingFormValues } from '../../components/app/listingForm'
import { listingsService } from '../../services/listings'

const empty: ListingFormValues = {
  title: '', category: '', description: '',
  price: '', listing_type: 'service', delivery_days: '',
}

export default function NewListingPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ListingFormValues>(empty)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        skill_ids: selectedTags,
      })
      navigate('/app/listings')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">New listing</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default">Create a listing</p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              Describe the skill or service you're offering to other students
            </p>
          </div>
          <Link
            to="/app/listings"
            className="flex items-center gap-1.5 text-[12px] font-medium text-fg-muted dark:text-fg-dark-muted hover:text-brand dark:hover:text-brand-dark-DEFAULT transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
      </div>

      <ListingForm
        values={form}
        selectedTags={selectedTags}
        loading={loading}
        error={error}
        submitLabel="Publish listing"
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onTagToggle={(tag) => setSelectedTags((prev) =>
          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/app/listings')}
      />
    </div>
  )
}
