'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useMemo, useRef } from 'react'

type MagneticButtonProps = {
  href?: string
  onClick?: () => void
  className?: string
  children: ReactNode
}

export function MagneticButton({ href, onClick, className = '', children }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let tx = 0
    let ty = 0

    const render = () => {
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
      raf = 0
    }

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      const max = 14
      tx = Math.max(-max, Math.min(max, x * 0.12))
      ty = Math.max(-max, Math.min(max, y * 0.12))
      if (!raf) raf = requestAnimationFrame(render)
    }

    const onLeave = () => {
      tx = 0
      ty = 0
      if (!raf) raf = requestAnimationFrame(render)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf) cancelAnimationFrame(raf)
      if (el) el.style.transform = ''
    }
  }, [prefersReducedMotion])

  const createRipple = (e: React.PointerEvent) => {
    if (prefersReducedMotion) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.style.position = 'absolute'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    ripple.style.width = `${size}px`
    ripple.style.height = `${size}px`
    ripple.style.borderRadius = '9999px'
    ripple.style.background = 'radial-gradient(circle, rgba(0,245,255,0.35) 0%, rgba(163,255,0,0.12) 35%, rgba(255,255,255,0) 70%)'
    ripple.style.transform = 'scale(0.35)'
    ripple.style.opacity = '0.9'
    ripple.style.pointerEvents = 'none'
    ripple.style.filter = 'blur(2px)'
    ripple.style.transition = 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 900ms ease'

    el.style.position = 'relative'
    el.style.overflow = 'hidden'
    el.appendChild(ripple)
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)'
      ripple.style.opacity = '0'
    })
    window.setTimeout(() => ripple.remove(), 950)
  }

  const base =
    'tap-target inline-flex items-center justify-center gap-2 rounded-2xl select-none will-change-transform'

  if (href) {
    return (
      <Link
        ref={ref as any}
        href={href}
        onClick={onClick}
        onPointerDown={createRipple}
        className={`${base} ${className}`}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      ref={ref as any}
      onClick={onClick}
      onPointerDown={createRipple}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  )
}

