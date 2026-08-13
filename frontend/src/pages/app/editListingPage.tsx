import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { HiOutlineArrowLeft, HiOutlineArrowPath } from 'react-icons/hi2'
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
      setError(msg ?? 'failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="border border-[#e2e4e8] dark:border-[#1e2228] animate-pulse">
        <div className="h-9 bg-[#f6f8fa] dark:bg-[#0d1117] border-b border-[#e2e4e8] dark:border-[#1e2228]" />
        <div className="p-4 space-y-3">
          <div className="h-2.5 w-32 bg-[#e2e4e8] dark:bg-[#1e2228]" />
          <div className="h-2 w-48 bg-[#e2e4e8] dark:bg-[#1e2228]" />
        </div>
      </div>
      <div className="border border-[#e2e4e8] dark:border-[#1e2228] h-64 animate-pulse bg-[#f6f8fa] dark:bg-[#0d1117]" />
      <div className="flex items-center justify-center py-4">
        <HiOutlineArrowPath className="w-4 h-4 text-[#636c76] dark:text-[#848d97] animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Page header */}
      <div className="border border-[#e2e4e8] dark:border-[#1e2228]">
        <div className="px-4 py-2.5 border-b border-[#e2e4e8] dark:border-[#1e2228] bg-[#f6f8fa] dark:bg-[#0d1117] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8490f] dark:bg-[#ff6b35]" />
          <span className="font-mono text-[9px] tracking-widest text-[#636c76] dark:text-[#848d97] uppercase">edit listing</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-[#1f2328] dark:text-[#e6edf3] font-medium truncate">
              {listing?.title ?? 'edit listing'}
            </p>
            <p className="font-mono text-[9px] text-[#636c76] dark:text-[#848d97] mt-0.5">
              update your listing details
            </p>
          </div>
          <Link
            to={`/app/listings/${id}`}
            className="flex items-center gap-1.5 font-mono text-[9px] tracking-wide text-[#636c76] dark:text-[#848d97] hover:text-[#e8490f] dark:hover:text-[#ff6b35] transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="w-3.5 h-3.5" />
            back
          </Link>
        </div>
      </div>

      <ListingForm
        values={form}
        selectedTags={selectedTags}
        loading={saving}
        error={error}
        submitLabel="save changes"
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
