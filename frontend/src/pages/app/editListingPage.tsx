import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import ListingForm, { type ListingFormValues } from '../../components/app/listingForm'
import { listingsService, type Listing } from '../../services/listings'

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [form, setForm] = useState<ListingFormValues>({
    title: '', category: '', description: '',
    price: '', listing_type: 'service', delivery_days: '',
  })

  useEffect(() => {
    if (!id) return
    listingsService.getById(id).then((l: Listing) => {
      setListing(l)
      setForm({
        title: l.title,
        category: l.category,
        description: l.description,
        price: l.price ? String(l.price) : '',
        listing_type: l.listing_type,
        delivery_days: l.delivery_days ? String(l.delivery_days) : '',
      })
      setSelectedTags(l.skills.map((s) => s.name))
    }).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setError('')
    setSaving(true)
    try {
      await listingsService.update(id, {
        title: form.title,
        description: form.description,
        category: form.category,
        listing_type: form.listing_type,
        price: form.price ? parseFloat(form.price) : null,
        delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
        skill_ids: selectedTags,
      })
      navigate(`/app/listings/${id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className="h-10 bg-canvas-inset dark:bg-canvas-dark-inset border-b border-border-default dark:border-border-dark-default" />
        <div className="p-4 space-y-2">
          <div className="h-3 w-32 rounded bg-border-default dark:bg-border-dark-default" />
          <div className="h-2.5 w-48 rounded bg-border-default dark:bg-border-dark-default" />
        </div>
      </div>
      <div className="border border-border-default dark:border-border-dark-default rounded-xl h-64 bg-canvas-inset dark:bg-canvas-dark-inset" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      <div className="border border-border-default dark:border-border-dark-default rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border-default dark:border-border-dark-default bg-canvas-inset dark:bg-canvas-dark-inset">
          <span className="text-[11px] font-semibold text-fg-muted dark:text-fg-dark-muted">Edit listing</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg-default dark:text-fg-dark-default truncate">
              {listing?.title ?? 'Edit listing'}
            </p>
            <p className="text-[11px] text-fg-muted dark:text-fg-dark-muted mt-0.5">
              Update your listing details
            </p>
          </div>
          <Link
            to={`/app/listings/${id}`}
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
        loading={saving}
        error={error}
        submitLabel="Save changes"
        onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
        onTagToggle={(tag) => setSelectedTags((prev) =>
          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        )}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
