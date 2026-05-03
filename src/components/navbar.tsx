'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { Bike, Menu, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const Navbar = () => {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logoOk, setLogoOk] = useState(true)
  const [logoOpen, setLogoOpen] = useState(false)
  const { scrollY } = useScroll()

  const navHeight = useTransform(scrollY, [0, 56], ["88px", "72px"])
  const navBg = useTransform(scrollY, [0, 56], ["rgba(5,6,8,0.10)", "rgba(5,6,8,0.72)"])
  const navBorder = useTransform(scrollY, [0, 56], ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.16)"])

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  if (!mounted) return null

  const items = [
    { label: 'Promo', id: 'promozioni' },
    { label: 'Shop', id: 'prodotti' },
    { label: 'Riparazioni', id: 'riparazioni' },
    { label: 'Perché', id: 'perche' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Contatti', id: 'contatti' },
  ]

  return (
    <motion.nav
      style={{ height: navHeight, background: navBg, borderColor: navBorder }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center backdrop-blur-xl transition-colors duration-300 border-b pt-[env(safe-area-inset-top)]"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
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
                alt="VincenzoBike"
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
            Vincenzo<span className="text-gradient">Bike</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-semibold tracking-wide text-white/75 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
          
          <div className="flex items-center gap-3 ml-6">
            <Link
              href="#contatti"
              className="tap-target px-5 py-3 rounded-2xl btn-primary font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_40px_rgba(0,245,255,0.20)] transition-shadow"
            >
              Contattaci
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            className="tap-target p-3 rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xl"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen)
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
            }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Overlay) */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 p-6 md:hidden glass-dark border-b border-white/10"
        >
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
                }}
                className="tap-target w-full px-4 py-4 rounded-2xl bg-white/3 border border-white/10 text-lg font-bold text-white/90 active:bg-white/8 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

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
                    <img src="/logo-vincenzobike.png?v=3" alt="VincenzoBike" className="w-40 h-40 object-contain" />
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
    </motion.nav>
  )
}
