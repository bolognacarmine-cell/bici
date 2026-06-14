'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type CookieConsent = 'accepted' | 'rejected'

const STORAGE_KEY = 'cookie_consent'

function readConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === 'accepted' || raw === 'rejected') return raw
  return null
}

function writeConsent(value: CookieConsent) {
  window.localStorage.setItem(STORAGE_KEY, value)
}

export function CookieBanner() {
  const pathname = usePathname()
  const hidden = useMemo(() => pathname.startsWith('/admin'), [pathname])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (hidden) return
    const existing = readConsent()
    setVisible(!existing)
  }, [hidden])

  if (hidden || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <div className="mx-auto max-w-3xl glass-dark border border-white/12 rounded-[28px] p-4 md:p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-white font-extrabold tracking-tight">Cookie</div>
            <div className="mt-1 text-white/70 text-sm leading-relaxed">
              Usiamo cookie tecnici necessari al funzionamento del sito. Puoi accettare o rifiutare eventuali cookie non
              essenziali. Leggi{' '}
              <Link href="/cookie-policy" className="underline underline-offset-4">
                Cookie Policy
              </Link>{' '}
              e{' '}
              <Link href="/privacy" className="underline underline-offset-4">
                Privacy
              </Link>
              {' '}e{' '}
              <Link href="/termini-e-condizioni" className="underline underline-offset-4">
                Termini e Condizioni
              </Link>
              .
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              className="tap-target btn-secondary px-5 py-3 font-bold border border-white/12"
              onClick={() => {
                writeConsent('rejected')
                setVisible(false)
              }}
            >
              Rifiuta
            </button>
            <button
              type="button"
              className="tap-target btn-primary px-5 py-3 font-bold"
              onClick={() => {
                writeConsent('accepted')
                setVisible(false)
              }}
            >
              Accetta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

