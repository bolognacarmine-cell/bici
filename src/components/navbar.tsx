'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sun, Moon, Bike, Menu, X, Search, Mic } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

export const Navbar = () => {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { scrollY } = useScroll()

  const navHeight = useTransform(scrollY, [0, 50], ["90px", "70px"])
  const navBg = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", "rgba(255,255,255,0.7)"])

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <motion.nav
      style={{ height: navHeight, background: navBg }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center glass backdrop-blur-xl transition-colors duration-300 pt-[env(safe-area-inset-top)]"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 btn-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <Bike className="text-white w-6 h-6" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight">
            Ciclofficina <span className="text-gradient">Vincenzo</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Promozioni', id: 'promozioni' },
            { label: 'Storia', id: 'storia' },
            { label: 'Servizi', id: 'servizi' },
            { label: 'Prodotti', id: 'prodotti' },
            { label: 'Perché', id: 'perche' },
            { label: 'Contatti', id: 'contatti' }
          ].map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className="font-medium text-zinc-600 dark:text-zinc-300 hover:text-primary-start transition-colors"
            >
              {item.label}
            </Link>
          ))}
          
          <div className="flex items-center gap-4 ml-4">
             <button className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                <Search className="w-5 h-5 text-zinc-500" />
             </button>
             <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
           <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen)
              if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
            }}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </div>

      {/* Mobile Menu (Overlay) */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 md:hidden glass-dark"
        >
          <div className="flex flex-col gap-6 items-center">
            {[
              { label: 'Promozioni', id: 'promozioni' },
              { label: 'Storia', id: 'storia' },
              { label: 'Servizi', id: 'servizi' },
              { label: 'Prodotti', id: 'prodotti' },
              { label: 'Perché', id: 'perche' },
              { label: 'Contatti', id: 'contatti' }
            ].map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10)
                }}
                className="text-xl font-bold w-full py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-center active:bg-zinc-100 dark:active:bg-zinc-800 transition-colors"
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
