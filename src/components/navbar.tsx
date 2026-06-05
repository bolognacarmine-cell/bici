'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Bike, X, ArrowRight, PhoneCall, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CONTACT_ANTONIO_PHONE,
  CONTACT_LUIGI_PHONE,
  CONTACT_TEL_HREF,
  CONTACT_LUIGI_TEL_HREF,
  CONTACT_WHATSAPP_HREF,
} from '@/lib/contact'

export const Navbar = () => {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoOk, setLogoOk] = useState(true)
  const [logoOpen, setLogoOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLElement | null>(null)
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null)
  const prevOpenRef = useRef(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  const navHeight = useTransform(scrollY, [0, 56], ["88px", "72px"])
  const navBg = useTransform(scrollY, [0, 56], ["rgba(5,6,8,0.10)", "rgba(5,6,8,0.72)"])
  const navBorder = useTransform(scrollY, [0, 56], ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.16)"])

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mounted) return
    document.body.classList.toggle('menu-push-open', mobileMenuOpen)
    return () => {
      document.body.classList.remove('menu-push-open')
    }
  }, [mobileMenuOpen, mounted])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (menuRef.current && menuRef.current.contains(target)) return
      if (btnRef.current && btnRef.current.contains(target)) return
      setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mounted) return
    if (!prevOpenRef.current && mobileMenuOpen) {
      const id = window.setTimeout(() => firstLinkRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [mobileMenuOpen, mounted])

  useEffect(() => {
    if (!mounted) return
    if (prevOpenRef.current && !mobileMenuOpen) {
      btnRef.current?.focus()
    }
    prevOpenRef.current = mobileMenuOpen
  }, [mobileMenuOpen, mounted])

  if (!mounted) return null
  if (pathname.startsWith('/admin')) return null

  const items = [
    { label: 'Promo', id: 'promozioni' },
    { label: 'Catalogo', id: 'prodotti' },
    { label: 'Riparazioni', id: 'riparazioni' },
    { label: 'Perché', id: 'perche' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Contatti', id: 'contatti' },
  ]

  return (
    <>
      <motion.nav
        style={{ height: navHeight, background: navBg, borderColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center backdrop-blur-xl transition-colors duration-300 border-b pt-[env(safe-area-inset-top)]"
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <button
              type="button"
              onClick={() => {
                setLogoOpen(true)
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
              }}
              className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/8 border border-white/20 neon-ring shadow-[0_0_30px_rgba(0,245,255,0.18)] group-hover:scale-[1.04] transition-transform duration-300 cursor-zoom-in"
              aria-label="Apri il logo"
            >
              {logoOk ? (
                <img
                  src="/logo-vincenzobike.png?v=3"
                  alt="Ciclo Moto"
                  width={44}
                  height={44}
                  className="h-10 w-10 object-contain rounded-full opacity-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
                  onError={() => setLogoOk(false)}
                />
              ) : (
                <Bike className="text-white w-7 h-7 drop-shadow-[0_0_12px_rgba(0,245,255,0.35)]" />
              )}
            </button>
            <Link href="/" className="font-display text-2xl font-bold tracking-tight">
              Ciclo<span className="text-gradient">moto</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {items.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/#${item.id}`}
                className="text-sm font-semibold tracking-wide text-white/75 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 ml-6">
              <a
                href={CONTACT_TEL_HREF}
                className="tap-target px-5 py-3 rounded-2xl btn-primary font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_40px_rgba(0,245,255,0.20)] transition-shadow"
              >
                <PhoneCall className="w-4 h-4" />
                Chiama Antonio: {CONTACT_ANTONIO_PHONE}
              </a>
              <a
                href={CONTACT_LUIGI_TEL_HREF}
                className="tap-target px-5 py-3 rounded-2xl btn-secondary font-bold text-sm flex items-center gap-2 border border-white/12"
              >
                <PhoneCall className="w-4 h-4" />
                Chiama Luigi: {CONTACT_LUIGI_PHONE}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.nav>

      <button
        ref={btnRef}
        type="button"
        aria-label="Menu"
        aria-controls="hamburgerMenu"
        aria-expanded={mobileMenuOpen}
        className="md:hidden fixed right-6 top-[calc(env(safe-area-inset-top)+16px)] z-[110] w-12 h-12 rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xl"
        onClick={() => {
          setMobileMenuOpen(!mobileMenuOpen)
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
        }}
      >
        <span
          className={`absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 bg-white/90 transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-y-0 rotate-45' : '-translate-y-[7px] rotate-0'
          }`}
        />
        <span
          className={`absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 bg-white/90 transition-all duration-300 ${
            mobileMenuOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 bg-white/90 transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[7px] rotate-0'
          }`}
        />
      </button>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            ref={menuRef}
            id="hamburgerMenu"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden fixed left-0 top-0 bottom-0 z-[105] w-[280px] text-white shadow-2xl"
            style={{ backgroundColor: '#2c3e50' }}
            role="dialog"
            aria-label="Menu"
          >
            <div className="h-full flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+18px)] pb-[calc(env(safe-area-inset-bottom)+18px)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-extrabold tracking-tight text-xl">Ciclomoto</div>
                  <div className="text-white/80 text-sm mt-1">Officina bici · Marcianise</div>
                </div>
                <button
                  type="button"
                  className="tap-target p-2 rounded-2xl bg-white/10 border border-white/15 text-white/90"
                  aria-label="Chiudi"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2 overflow-auto">
                {items.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/#${item.id}`}
                    ref={idx === 0 ? firstLinkRef : undefined}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
                    }}
                    className="tap-target w-full px-4 py-4 rounded-2xl bg-white/10 border border-white/15 text-base font-extrabold text-white active:bg-white/15 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <a
                  href={CONTACT_WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target w-full px-5 py-4 rounded-2xl font-extrabold inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25D366', color: '#0b0d12' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Scrivici su WhatsApp
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {logoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setLogoOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md glass-dark border border-white/12 rounded-[32px] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                <div>
                  <div className="text-white font-extrabold tracking-tight">Logo Ciclofficina Vincenzo</div>
                  <div className="text-white/65 text-xs mt-1">In memoria di Vincenzo</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoOpen(false)}
                  className="tap-target p-2 rounded-2xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/8 transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-44 h-44 rounded-full overflow-hidden bg-white/6 border border-white/12 shadow-[0_0_55px_rgba(0,245,255,0.16)] flex items-center justify-center">
                  {logoOk ? (
                    <img src="/logo-vincenzobike.png?v=3" alt="Ciclo Moto" className="w-40 h-40 object-contain" />
                  ) : (
                    <Bike className="text-white w-14 h-14 opacity-90" />
                  )}
                </div>
                <div className="mt-6 text-white/75 leading-relaxed">
                  Questo sito è dedicato a Vincenzo. Il logo rappresenta la sua storia e la sua officina.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
