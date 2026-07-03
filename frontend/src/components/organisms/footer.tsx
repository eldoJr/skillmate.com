import { Link } from 'react-router-dom'
import Logo from '../atoms/logo'

const links = {
  Platform: [
    { label: 'Explore', href: '/explore' },
    { label: 'Listings', href: '/listings' },
    { label: 'Messages', href: '/messages' },
    { label: 'Reviews', href: '/reviews' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#d0d7de] dark:border-[#21262d]">
      <div className="max-w-[1250px] mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-4">
              <Logo width={26} height={26} />
            </div>
            <p className="text-sm text-[#636c76] dark:text-[#848d97] leading-relaxed">
              Connecting university students to offer, discover, and exchange skills in a trusted academic ecosystem.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 sm:gap-16 flex-wrap">
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#636c76] dark:text-[#848d97] mb-4">
                  {title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        className="text-sm text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#d0d7de] dark:border-[#21262d] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#636c76] dark:text-[#848d97]">
            &copy; {new Date().getFullYear()} Skillmate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-[#636c76] dark:text-[#848d97] hover:text-[#1f2328] dark:hover:text-[#e6edf3] transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
