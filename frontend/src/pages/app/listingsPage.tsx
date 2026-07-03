import { useState } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineStar,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2'

const myListings = [
  { id: '1', title: 'React & TypeScript Development', category: 'Programming', price: 'R150/hr', status: 'active', views: 48, inquiries: 5, rating: 4.9, reviews: 12, tags: ['React', 'TypeScript'] },
  { id: '2', title: 'Python Scripting & Automation', category: 'Programming', price: 'R120/hr', status: 'active', views: 23, inquiries: 2, rating: 0, reviews: 0, tags: ['Python', 'Automation'] },
  { id: '3', title: 'Technical Report Writing', category: 'Writing', price: 'R70/hr', status: 'paused', views: 11, inquiries: 1, rating: 5.0, reviews: 3, tags: ['Reports', 'Technical'] },
]

export default function ListingsPage() {
  const [listings, setListings] = useState(myListings)

  const toggleStatus = (id: string) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: l.status === 'active' ? 'paused' : 'active' } : l))
  }

  const remove = (id: string) => setListings((prev) => prev.filter((l) => l.id !== id))

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#1f2328] dark:text-[#e6edf3]">My Listings</h2>
          <p className="text-[12px] text-[#636c76] dark:text-[#848d97] mt-0.5">{listings.filter((l) => l.status === 'active').length} active · {listings.length} total</p>
        </div>
        <Link
          to="/app/listings/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#0969da] dark:bg-[#2f81f7] text-white hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors"
        >
          <HiOutlinePlusCircle className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-12 text-center">
          <p className="text-[13px] text-[#636c76] dark:text-[#848d97] mb-3">You haven't created any listings yet.</p>
          <Link to="/app/listings/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-[#0969da] text-white hover:bg-[#0860ca] transition-colors">
            <HiOutlinePlusCircle className="w-4 h-4" /> Create your first listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="rounded-2xl bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-semibold text-[#1f2328] dark:text-[#e6edf3] truncate">{listing.title}</h3>
                    <span className={clsx(
                      'shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full',
                      listing.status === 'active'
                        ? 'bg-[#dafbe1] dark:bg-[#0f2d1a] text-[#1a7f37] dark:text-[#3fb950]'
                        : 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97]',
                    )}>
                      {listing.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#636c76] dark:text-[#848d97]">
                    <span className="px-2 py-0.5 rounded-full bg-[#ddf4ff] dark:bg-[#121d2f] text-[#0969da] dark:text-[#2f81f7] font-medium">{listing.category}</span>
                    <span className="font-semibold text-[#1f2328] dark:text-[#e6edf3]">{listing.price}</span>
                    <span className="flex items-center gap-0.5"><HiOutlineEye className="w-3.5 h-3.5" /> {listing.views} views</span>
                    <span className="flex items-center gap-0.5"><HiOutlineChatBubbleOvalLeft className="w-3.5 h-3.5" /> {listing.inquiries} inquiries</span>
                    {listing.reviews > 0 && (
                      <span className="flex items-center gap-0.5"><HiOutlineStar className="w-3.5 h-3.5 text-[#9a6700] dark:text-[#d29922]" /> {listing.rating} ({listing.reviews})</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {listing.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#636c76] dark:text-[#848d97] border border-[#d0d7de] dark:border-[#30363d]">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleStatus(listing.id)}
                    title={listing.status === 'active' ? 'Pause listing' : 'Activate listing'}
                    className="p-2 rounded-xl transition-colors cursor-pointer text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]"
                  >
                    {listing.status === 'active'
                      ? <HiOutlineXCircle className="w-4 h-4" />
                      : <HiOutlineCheckCircle className="w-4 h-4 text-[#1a7f37] dark:text-[#3fb950]" />
                    }
                  </button>
                  <button className="p-2 rounded-xl transition-colors cursor-pointer text-[#636c76] dark:text-[#848d97] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d] hover:text-[#1f2328] dark:hover:text-[#e6edf3]">
                    <HiOutlinePencilSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(listing.id)}
                    className="p-2 rounded-xl transition-colors cursor-pointer text-[#636c76] dark:text-[#848d97] hover:bg-[#fff0ee] dark:hover:bg-[#2d1216] hover:text-[#d1242f] dark:hover:text-[#f85149]"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
