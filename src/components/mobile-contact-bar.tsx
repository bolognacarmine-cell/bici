'use client'

import { usePathname } from 'next/navigation'
import { PhoneCall } from 'lucide-react'
import { CONTACT_ANTONIO_PHONE, CONTACT_ANTONIO_TEL_HREF, CONTACT_LUIGI_PHONE, CONTACT_LUIGI_TEL_HREF } from '@/lib/contact'

export function MobileContactBar() {
  const pathname = usePathname()
  const hidden = pathname.startsWith('/admin')
  if (hidden) return null

  return (
    <>
      <div className="md:hidden h-24" aria-hidden="true" />
      <div className="md:hidden fixed left-0 right-0 bottom-0 z-[80] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="glass-dark border border-white/12 rounded-[28px] p-2 backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-2">
            <a href={CONTACT_ANTONIO_TEL_HREF} className="tap-target btn-primary h-12 font-bold inline-flex items-center justify-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Chiama Antonio: {CONTACT_ANTONIO_PHONE}
            </a>
            <a
              className="tap-target btn-secondary h-12 font-bold border border-white/12 inline-flex items-center justify-center gap-2"
              href={CONTACT_LUIGI_TEL_HREF}
            >
              <PhoneCall className="h-5 w-5" />
              Chiama Luigi: {CONTACT_LUIGI_PHONE}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
