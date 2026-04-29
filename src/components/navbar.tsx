'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Bike, Menu, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const Navbar = () => {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  const navHeight = useTransform(scrollY, [0, 56], ["88px", "72px"])
  const navBg = useTransform(scrollY, [0, 56], ["rgba(5,6,8,0.10)", "rgba(5,6,8,0.72)"])
  const navBorder = useTransform(scrollY, [0, 56], ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.16)"])

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const items = [
    { label: 'Servizi', id: 'servizi' },
    { label: 'Perché', id: 'perche' },
    { label: 'Officina', id: 'tecnologia' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Recensioni', id: 'testimonial' },
    { label: 'Contatti', id: 'contatti' },
  ]

  return (
    <motion.nav
      style={{ height: navHeight, background: navBg, borderColor: navBorder }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center backdrop-blur-xl transition-colors duration-300 border-b pt-[env(safe-area-inset-top)]"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/6 border border-white/12 neon-ring group-hover:scale-[1.03] transition-transform duration-300">
            <Bike className="text-white w-6 h-6 opacity-90" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            Vincenzo<span className="text-gradient">Bike</span>
          </span>
        </Link>

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
    </motion.nav>
  )
}
