'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { toHostedAssetUrl } from '@/lib/asset-url'

type Props = {
  images: string[]
  alt: string
  sizes?: string
  className?: string
  imageClassName?: string
  objectPosition?: string
}

export function MediaCarousel({
  images,
  alt,
  sizes = '100vw',
  className = '',
  imageClassName = 'object-cover',
  objectPosition,
}: Props) {
  const safeImages = useMemo(() => images.filter(Boolean), [images])
  const [index, setIndex] = useState(0)
  const startXRef = useRef<number | null>(null)

  useEffect(() => {
    setIndex(0)
  }, [safeImages.length])

  if (safeImages.length === 0) return null

  const hasMany = safeImages.length > 1
  const prev = () => setIndex((v) => (v - 1 + safeImages.length) % safeImages.length)
  const next = () => setIndex((v) => (v + 1) % safeImages.length)

  return (
    <div
      className={twMerge('group relative', className)}
      tabIndex={hasMany ? 0 : -1}
      aria-roledescription={hasMany ? 'carousel' : undefined}
      aria-label={hasMany ? 'Galleria immagini' : undefined}
      onKeyDown={(e) => {
        if (!hasMany) return
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
      onPointerDown={(e) => {
        if (!hasMany) return
        if (e.pointerType === 'mouse' && e.button !== 0) return
        startXRef.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (!hasMany) return
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
      <Image
        src={toHostedAssetUrl(safeImages[index] ?? safeImages[0])}
        alt={alt}
        fill
        sizes={sizes}
        className={imageClassName}
        style={objectPosition ? { objectPosition } : undefined}
      />

      {hasMany && (
        <>
          <button
            type="button"
            aria-label="Immagine precedente"
            onClick={(e) => {
              e.preventDefault()
              prev()
            }}
            className="tap-target absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-black/35 border border-white/15 text-white/90 backdrop-blur-sm grid place-items-center opacity-90 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Immagine successiva"
            onClick={(e) => {
              e.preventDefault()
              next()
            }}
            className="tap-target absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-black/35 border border-white/15 text-white/90 backdrop-blur-sm grid place-items-center opacity-90 hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/35 border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm">
            {index + 1}/{safeImages.length}
          </div>
        </>
      )}
    </div>
  )
}
