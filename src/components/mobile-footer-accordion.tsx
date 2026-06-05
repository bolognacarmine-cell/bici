'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Facebook, Instagram, MapPin } from 'lucide-react'
import { CONTACT_TEL_HREF, CONTACT_LUIGI_TEL_HREF, CONTACT_WHATSAPP_HREF } from '@/lib/contact'

type SectionKey = 'contatti' | 'link' | 'social'

export function MobileFooterAccordion() {
  const pathname = usePathname()
  const hidden = pathname.startsWith('/admin')
  const [open, setOpen] = useState<SectionKey | null>('contatti')

  const sections = useMemo(
    () =>
      [
        {
          key: 'contatti' as const,
          title: 'Contatti',
          contentId: 'footer-accordion-contatti',
          items: (
            <div className="grid gap-2">
              <a href={CONTACT_TEL_HREF} className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white">
                Chiama Antonio
              </a>
              <a
                href={CONTACT_LUIGI_TEL_HREF}
                className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white"
              >
                Chiama Luigi
              </a>
              <a
                href={CONTACT_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-full px-4 py-4 rounded-2xl font-extrabold text-[var(--color-ink)]"
                style={{ backgroundColor: '#25D366' }}
              >
                WhatsApp
              </a>
              <Link
                href="/#contatti"
                className="tap-target w-full px-4 py-4 rounded-2xl bg-white/4 border border-white/10 font-bold text-white/90"
              >
                Vai a Contatti
              </Link>
            </div>
          ),
        },
        {
          key: 'link' as const,
          title: 'Link utili',
          contentId: 'footer-accordion-link',
          items: (
            <div className="grid gap-2">
              <Link href="/" className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white">
                Home
              </Link>
              <div className="grid gap-2 rounded-2xl bg-white/4 border border-white/10 p-2">
                <Link href="/#promozioni" className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white">
                  Promo
                </Link>
                <Link href="/#prodotti" className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white">
                  Catalogo
                </Link>
                <Link
                  href="/#riparazioni"
                  className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white"
                >
                  Riparazioni
                </Link>
                <Link href="/#perche" className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white">
                  Perché
                </Link>
                <Link href="/#gallery" className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white">
                  Gallery
                </Link>
              </div>
              <div className="grid gap-2 rounded-2xl bg-white/4 border border-white/10 p-2">
                <Link
                  href="/cookie-policy"
                  className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white/90"
                >
                  Cookie Policy
                </Link>
                <Link
                  href="/privacy"
                  className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white/90"
                >
                  Privacy
                </Link>
                <Link
                  href="/legal-notice"
                  className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white/90"
                >
                  Note legali
                </Link>
              </div>
            </div>
          ),
        },
        {
          key: 'social' as const,
          title: 'Social',
          contentId: 'footer-accordion-social',
          items: (
            <div className="grid gap-3">
              <div className="inline-flex items-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61590511562992"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook (apre in una nuova scheda)"
                  title="Facebook"
                  className="tap-target w-11 h-11 inline-flex items-center justify-center rounded-2xl bg-white/6 border border-white/12 text-white/85 hover:text-[#1877f2] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/ciclomoto2026/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram (apre in una nuova scheda)"
                  title="Instagram"
                  className="tap-target w-11 h-11 inline-flex items-center justify-center rounded-2xl bg-white/6 border border-white/12 text-white/85 hover:text-[#e1306c] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>

              <a
                href="https://maps.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-full px-4 py-4 rounded-2xl bg-white/6 border border-white/12 font-bold text-white inline-flex items-center justify-between"
              >
                Google Maps
                <MapPin className="w-5 h-5 text-white/75" />
              </a>
            </div>
          ),
        },
      ] as const,
    []
  )

  if (hidden) return null

  return (
    <footer className="md:hidden border-t border-white/10 bg-[rgba(17,19,26,0.35)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-screen-md px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+110px)]">
        <div className="text-white/85 font-extrabold tracking-tight text-lg">Ciclomoto</div>
        <div className="text-white/60 text-sm mt-1">Officina bici · Marcianise</div>

        <div className="mt-4 grid gap-3">
          {sections.map((s) => {
            const isOpen = open === s.key
            return (
              <section key={s.key} className="rounded-[22px] bg-white/4 border border-white/10 overflow-hidden">
                <button
                  type="button"
                  className="tap-target w-full px-4 py-4 inline-flex items-center justify-between gap-3 text-left"
                  aria-expanded={isOpen}
                  aria-controls={s.contentId}
                  onClick={() => setOpen((prev) => (prev === s.key ? null : s.key))}
                >
                  <span className="text-white font-extrabold">{s.title}</span>
                  <ChevronDown className={`w-5 h-5 text-white/75 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>

                <div
                  id={s.contentId}
                  className={`grid px-4 pb-4 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 motion-reduce:transition-none`}
                  style={{
                    maxHeight: isOpen ? 1200 : 0,
                    overflow: 'hidden',
                    transitionProperty: 'max-height, opacity',
                    transitionDuration: '300ms',
                    transitionTimingFunction: 'ease-in-out',
                  }}
                  aria-hidden={!isOpen}
                >
                  <div className="pt-1">{s.items}</div>
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-6 text-white/50 text-xs">© {new Date().getFullYear()} Ciclomoto</div>
      </div>
    </footer>
  )
}
