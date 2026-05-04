'use client'

import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) {
      el.style.display = 'none'
      return
    }

    let raf = 0
    let x = 0
    let y = 0

    const render = () => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      raf = 0
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(render)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-0 w-0"
    >
      <div className="-translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,245,255,0.12)_0%,rgba(163,255,0,0.08)_25%,rgba(255,255,255,0)_62%)] blur-2xl" />
    </div>
  )
}

