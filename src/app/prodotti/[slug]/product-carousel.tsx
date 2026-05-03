'use client'

import Image from 'next/image'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toHostedAssetUrl } from '@/lib/asset-url'

type ProductCarouselProps = {
  images: string[]
  productName: string
}

export function ProductCarousel({ images, productName }: ProductCarouselProps) {
  const safeImages = useMemo(() => {
    const items = Array.isArray(images) ? images.map(String).filter(Boolean) : []
    return items.length > 0 ? items : [toHostedAssetUrl('/bici1.jpg')]
  }, [images])

  const [index, setIndex] = useState(0)
  const startXRef = useRef<number | null>(null)

  const goTo = useCallback(
    (next: number) => {
      const total = safeImages.length
      if (total <= 1) {
        setIndex(0)
        return
      }
      const normalized = ((next % total) + total) % total
      setIndex(normalized)
    },
    [safeImages.length]
  )

  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  return (
    <section
      className="glass border border-white/12 rounded-[28px] p-4 md:p-6"
      aria-label="Galleria immagini prodotto"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
      onPointerDown={(e) => {
        if (safeImages.length <= 1) return
        if (e.pointerType === 'mouse' && e.button !== 0) return
        startXRef.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (safeImages.length <= 1) return
        const startX = startXRef.current
        startXRef.current = null
        if (typeof startX !== 'number') return
        const dx = e.clientX - startX
        if (Math.abs(dx) < 35) return
        if (dx < 0) next()
        else prev()
      }}
      onPointerCancel={() => {
        startXRef.current = null
      }}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/3 border border-white/10">
        <Image
          src={toHostedAssetUrl(safeImages[index] ?? '/bici1.jpg')}
          alt={`${productName} — immagine ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.00)_45%,rgba(5,6,8,0.60)_100%)]" />

        <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between gap-3">
          <div className="glass border border-white/12 rounded-2xl px-3 py-2 text-white/80 text-xs font-semibold">
            {index + 1}/{safeImages.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={safeImages.length <= 1}
              className="tap-target glass border border-white/12 rounded-2xl px-3 py-2 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50"
              aria-label="Immagine precedente"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              disabled={safeImages.length <= 1}
              className="tap-target glass border border-white/12 rounded-2xl px-3 py-2 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50"
              aria-label="Immagine successiva"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {safeImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {safeImages.map((src, i) => {
            const active = i === index
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => goTo(i)}
                className={
                  active
                    ? 'tap-target relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border-2 border-[#00d4ff] bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50'
                    : 'tap-target relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border border-white/12 bg-white/5 hover:border-white/25 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50'
                }
                aria-label={`Vai all'immagine ${i + 1}`}
                aria-current={active ? 'true' : undefined}
              >
                <Image src={toHostedAssetUrl(src)} alt={`${productName} — miniatura ${i + 1}`} fill sizes="64px" className="object-cover" />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

