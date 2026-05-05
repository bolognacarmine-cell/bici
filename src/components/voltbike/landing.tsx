'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Play,
  Sparkles,
  Star,
  Wrench,
  Home,
  ShoppingBag,
  MapPinned,
} from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { TiltCard } from '@/components/tilt-card'
import { CursorGlow } from '@/components/voltbike/cursor-glow'
import { MagneticButton } from '@/components/voltbike/magnetic-button'
import { MediaCarousel } from '@/components/media-carousel'
import initialData from '@/data.json'
import { SiteDataSchema } from '@/lib/site-data-schema'
import { toHostedAssetUrl } from '@/lib/asset-url'

gsap.registerPlugin(ScrollTrigger)

const reveal = {
  hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

function toImageUrl(input: any, fallbackSize: string) {
  if (!input) return null
  if (typeof input === 'string') return input
  const prompt = typeof input.prompt === 'string' ? input.prompt : null
  if (!prompt) return null
  const size = typeof input.size === 'string' ? input.size : fallbackSize
  return `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${encodeURIComponent(size)}`
}

export function VoltbikeLanding() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [data, setData] = useState<any>(initialData as any)
  const [dataError, setDataError] = useState<string | null>(null)
  const didFetchRef = useRef(false)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
  const euro = useMemo(() => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }), [])
  const dateFmt = useMemo(() => new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }), [])
  const dateTimeFmt = useMemo(
    () => new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    []
  )

  const formatPromoDate = (input: unknown) => {
    const raw = String(input ?? '').trim()
    if (!raw) return null
    const ms = Date.parse(raw)
    if (!Number.isFinite(ms)) return null
    const d = new Date(ms)
    const hasTime = raw.includes('T') || raw.includes(':')
    return hasTime ? dateTimeFmt.format(d) : dateFmt.format(d)
  }

  const getImageUrls = (entity: any, fallback: string) => {
    const raw = entity?.images
    const urls: string[] = []
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (typeof entry === 'string') {
          const u = entry.trim()
          if (u) urls.push(toHostedAssetUrl(u))
          continue
        }
        if (entry && typeof entry === 'object') {
          const u = String((entry as any).url ?? '').trim()
          if (u) urls.push(toHostedAssetUrl(u))
        }
      }
    }
    if (urls.length > 0) return urls
    const img = typeof entity?.image === 'string' ? entity.image.trim() : ''
    return img ? [toHostedAssetUrl(img)] : [toHostedAssetUrl(fallback)]
  }

  const services = ((data as any).services ?? []) as Array<any>
  const tech = ((data as any).technology ?? []) as Array<any>
  const gallery = ((data as any).gallery ?? []) as Array<any>
  const repairs = useMemo(() => {
    const list: Array<any> = []
    for (const s of services) list.push({ ...s, _kind: 'service' })
    for (const t of tech) {
      const id = typeof t?.id === 'string' ? t.id : `tech-${String(t?.title ?? '').toLowerCase().replace(/\s+/g, '-')}`
      list.push({ ...t, id, category: t?.category ?? 'Riparazioni', _kind: 'tech' })
    }
    return list
  }, [services, tech])
  const visiblePromotions = (((data as any).promotions ?? []) as Array<any>).filter((p) => {
    if (p?.showOnHome === false) return false
    const status = String(p?.status ?? 'draft')
    if (status === 'active') return true
    if (status === 'scheduled') {
      const now = Date.now()
      const starts = p?.startsAt ? Date.parse(String(p.startsAt)) : NaN
      const ends = p?.endsAt ? Date.parse(String(p.endsAt)) : NaN
      if (Number.isFinite(starts) && now < starts) return false
      if (Number.isFinite(ends) && now > ends) return false
      return true
    }
    return false
  })
  const visibleProducts = (((data as any).products ?? []) as Array<any>).filter((p) => {
    const status = String(p?.status ?? 'available')
    if (status === 'discontinued') return false

    const category = String(p?.category ?? '')
    if (category === 'spare_part') {
      const sizes = Array.isArray(p?.sizes) ? (p.sizes as Array<any>).map(String).map((s) => s.trim()).filter(Boolean) : []
      const hasSizes = sizes.length > 0
      const priceEur = typeof p?.priceEur === 'number' ? p.priceEur : Number.NaN
      const hasPriceEur = Number.isFinite(priceEur) && priceEur > 0
      return hasSizes && hasPriceEur
    }

    return true
  })
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (data as any).footer?.address ?? ''
  )}`

  useEffect(() => {
    if (didFetchRef.current) return
    didFetchRef.current = true

    const controller = new AbortController()
    fetch('/api/site-data', { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => null)
        if (!res.ok) {
          const msg = json && typeof json === 'object' && 'error' in json ? String((json as any).error) : 'Errore nel caricamento dati.'
          throw new Error(msg)
        }
        setData(SiteDataSchema.parse(json))
        setDataError(null)
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        setDataError(e instanceof Error ? e.message : 'Errore nel caricamento dati.')
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo(
        '.hero-word',
        { opacity: 0, y: 22, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.05, duration: 0.75 }
      )
        .fromTo('.hero-sub', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.25')
        .fromTo('.hero-cta', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
        .fromTo(
          '.hero-kpi',
          { opacity: 0, y: 14, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.08 },
          '-=0.15'
        )

      const sections = gsap.utils.toArray<HTMLElement>('[data-hscroll]')
      sections.forEach((section) => {
        const track = section.querySelector<HTMLElement>('[data-track]')
        if (!track) return

        const maxX = () => Math.max(0, track.scrollWidth - section.clientWidth)
        if (maxX() <= 0) return

        gsap.to(track, {
          x: () => -maxX(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${maxX()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      })

      ScrollTrigger.refresh()
    }, root)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return
    ScrollTrigger.refresh()
  }, [prefersReducedMotion, data])

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden bg-noise">
      <CursorGlow />
      <Navbar />

      <section id="hero" className="relative min-h-[108svh] md:min-h-[100svh] pt-28 md:pt-32">
        <div className="absolute inset-0">
          <Image
            src="/bici1.jpg"
            alt="Officina biciclette"
            fill
            priority
            sizes="100vw"
            className="md:hidden object-cover opacity-60"
            style={{ objectPosition: '32% 20%' }}
          />
          <Image
            src="/bici1.jpg"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="hidden md:block object-cover opacity-65"
            style={{ objectPosition: '30% 14%' }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_18%,rgba(0,245,255,0.12),transparent_62%),radial-gradient(900px_600px_at_90%_45%,rgba(163,255,0,0.10),transparent_60%),linear-gradient(180deg,rgba(5,6,8,0.18),rgba(5,6,8,0.82))]" />
          <div className="absolute inset-0 grid-overlay opacity-70" />
          <div className="absolute inset-0 scanline" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="rounded-[32px] md:rounded-none bg-black/14 md:bg-transparent border border-white/10 md:border-transparent backdrop-blur-[2px] md:backdrop-blur-0 p-5 md:p-0">
                {dataError && (
                  <div className="mb-5 rounded-2xl border border-[#e67e22]/30 bg-[#e67e22]/10 px-4 py-3 text-sm text-white/85">
                    <div className="font-semibold">Dati non aggiornati</div>
                    <div className="text-white/65 mt-1">{dataError}</div>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/12 text-white/80 text-xs tracking-widest uppercase font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[rgb(0,245,255)] shadow-[0_0_18px_rgba(0,245,255,0.55)]" />
                  Manutenzione · riparazioni · ricambi · accessori
                </div>

                <h1 className="mt-6 font-display font-extrabold tracking-tight text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.98]">
                  {(data as any).brand.headline.split(' ').map((w: string, i: number) => (
                    <span key={`${w}-${i}`} className="hero-word inline-block mr-3">
                      {w}
                    </span>
                  ))}
                </h1>

                <p className="hero-sub mt-6 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">
                  {(data as any).brand.subheadline}
                </p>

                <div className="hero-cta mt-10 flex flex-col sm:flex-row gap-4">
                  <MagneticButton href="#riparazioni" className="btn-primary px-7 py-4 font-bold">
                    Scopri le riparazioni
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                  <MagneticButton href="#contatti" className="btn-secondary px-7 py-4 font-bold border border-white/12">
                    Dove siamo
                    <MapPinned className="w-5 h-5" />
                  </MagneticButton>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                  {(data as any).kpis.map((k: any) => (
                    <div key={k.label} className="hero-kpi glass border border-white/10 rounded-2xl px-4 py-4 min-w-0">
                      <div className="text-white text-base sm:text-lg md:text-2xl font-extrabold tracking-tight leading-tight break-words">
                        {k.value}
                      </div>
                      <div className="text-white/60 text-xs tracking-wide uppercase mt-1">{k.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="glass border border-white/12 rounded-[32px] p-6 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="text-white font-bold tracking-tight">{(data as any).brand.name}</div>
                  <div className="text-white/50 text-xs font-semibold">Officina · Marcianise</div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <Wrench className="w-4 h-4 text-[rgb(163,255,0)]" />
                      Manutenzione
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">Check-up</div>
                    <div className="text-white/55 text-xs mt-1">Freni · cambio · ruote</div>
                  </div>
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <Home className="w-4 h-4 text-[rgb(0,245,255)]" />
                      A domicilio
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">Su richiesta</div>
                    <div className="text-white/55 text-xs mt-1">Riparazioni e assistenza</div>
                  </div>
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <ShoppingBag className="w-4 h-4 text-white/70" />
                      Accessori
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">In negozio</div>
                    <div className="text-white/55 text-xs mt-1">Ricambi · gadget · ordini</div>
                  </div>
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <MapPinned className="w-4 h-4 text-white/70" />
                      Dove siamo
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">Via Novelli, 51</div>
                    <div className="text-white/55 text-xs mt-1">Marcianise (CE)</div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[radial-gradient(500px_260px_at_30%_20%,rgba(0,245,255,0.18),transparent_60%),radial-gradient(500px_260px_at_70%_60%,rgba(163,255,0,0.12),transparent_65%)] border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white/80 text-sm font-semibold">Pompa gratuita</div>
                    <div className="text-white/60 text-xs">Gonfiaggio ruote</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full w-[100%] bg-[linear-gradient(90deg,rgba(0,245,255,0.95),rgba(163,255,0,0.9))]" />
                    </div>
                    <div className="text-white font-bold text-sm">Sempre</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      <section id="storia" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_20%,rgba(0,245,255,0.08),transparent_62%)]" />
        <div className="relative container mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Storia</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Addio a <span className="text-gradient">Vincenzo</span>
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Vincenzo Amati Bonaccorsi è cresciuto nel rione di S. Simeone a Marcianise. A soli 8 anni, quando tornava
              da scuola, passava i pomeriggi nella bottega del fratello Mimmo: lì ha imparato il mestiere “come si faceva
              una volta”, con pazienza e mani sporche di grasso.
            </p>
            <p className="mt-4 text-white/70 leading-relaxed">
              La sua gioia era vedere le persone risalire in sella in sicurezza. A 19 anni era già il mastro e i ciclisti
              chiedevano di lui. Con Antonetta Iodice ha costruito una famiglia: Antonio, Domenico e Luigi. Oggi la
              bottega di famiglia continua grazie ai figli: Antonio e Luigi portano avanti l’attività, mentre Domenico
              vive a Firenze. Vincenzo resta qui, in ogni riparazione fatta bene e in ogni bici che riparte.
            </p>
          </motion.div>
        </div>
      </section>

      {visiblePromotions.length > 0 && (
        <section id="promozioni" className="py-24 md:py-32 relative">
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_20%,rgba(163,255,0,0.06),transparent_62%)]" />
          <div className="relative container mx-auto px-6">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl"
            >
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Promozioni</div>
              <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
                Offerte <span className="text-gradient">in corso</span>
              </h2>
              <p className="mt-4 text-white/65 max-w-2xl">Offerte disponibili in questo periodo.</p>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
              {visiblePromotions.map((p, idx) => (
                <motion.div
                  key={`${p.title}-${idx}`}
                  initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-120px' }}
                  transition={{ duration: 0.7, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="group glass border border-white/12 rounded-[32px] overflow-hidden hover:border-white/20 transition-colors"
                >
                  <div className="relative aspect-[16/10] bg-white/3 overflow-hidden">
                    <MediaCarousel
                      images={getImageUrls(p, '/bici1.jpg')}
                      alt={p.title || 'Promozione'}
                      sizes="(max-width: 768px) 92vw, 46vw"
                      className="absolute inset-0"
                      imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      objectPosition="50% 40%"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.06)_0%,rgba(5,6,8,0.62)_72%,rgba(5,6,8,0.80)_100%)]" />
                  </div>
                  <div className="p-7 md:p-8">
                    <div className="text-white text-2xl font-extrabold tracking-tight font-display">
                      {p.title || 'Promozione'}
                    </div>
                    {(() => {
                      const price = typeof (p as any).priceEur === 'number' ? euro.format(Number((p as any).priceEur)) : null
                      const offerActive = Boolean((p as any).offerActive)
                      const offerPrice =
                        typeof (p as any).offerPriceEur === 'number' ? euro.format(Number((p as any).offerPriceEur)) : null
                      if (!price && !offerPrice) return null
                      return (
                        <div className="mt-4 flex items-center gap-3">
                          {offerActive && offerPrice ? (
                            <>
                              {price && <div className="text-white/50 line-through font-semibold">{price}</div>}
                              <div className="px-3 py-2 rounded-2xl bg-[rgba(163,255,0,0.10)] border border-[rgba(163,255,0,0.25)] text-white font-extrabold">
                                {offerPrice}
                              </div>
                            </>
                          ) : (
                            <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-white font-extrabold">
                              {price ?? offerPrice}
                            </div>
                          )}
                        </div>
                      )
                    })()}
                    {(() => {
                      const starts = formatPromoDate((p as any).startsAt)
                      const ends = formatPromoDate((p as any).endsAt)
                      if (!starts && !ends) return null
                      const label = starts && ends ? `Dal ${starts} al ${ends}` : starts ? `Dal ${starts}` : `Fino al ${ends}`
                      return <div className="mt-3 text-white/55 text-sm font-semibold">{label}</div>
                    })()}
                    <div className="mt-3 text-white/70 leading-relaxed">{p.description || ''}</div>
                    {Array.isArray((p as any).extensions) && (p as any).extensions.length > 0 && (
                      <div className="mt-5 grid grid-cols-1 gap-2">
                        {((p as any).extensions as any[]).map((ext, extIdx) => (
                          <div
                            key={`${ext?.label ?? 'ext'}-${extIdx}`}
                            className="flex items-start justify-between gap-4 rounded-2xl bg-white/4 border border-white/10 px-4 py-3"
                          >
                            <div className="text-white/75 font-semibold">{String(ext?.label ?? '')}</div>
                            <div className="text-white/60 font-semibold text-right">{String(ext?.value ?? '')}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <MagneticButton href="#contatti" className="btn-primary px-6 py-4 font-bold flex-1">
                        Richiedi info
                        <ArrowRight className="w-5 h-5" />
                      </MagneticButton>
                      <MagneticButton href="#riparazioni" className="btn-secondary px-6 py-4 font-bold border border-white/12">
                        Riparazioni
                        <Play className="w-5 h-5" />
                      </MagneticButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {visibleProducts.length > 0 && (
        <section id="prodotti" className="py-24 md:py-32">
          <div className="container mx-auto px-6">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl"
            >
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Prodotti</div>
              <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
                Catalogo, <span className="text-gradient">ricambi</span> e accessori
              </h2>
              <p className="mt-4 text-white/65 max-w-2xl">Disponibilità e dettagli su richiesta.</p>
            </motion.div>

            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleProducts.map((p, idx) => (
                <motion.div
                  key={`${p.name}-${idx}`}
                  initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-120px' }}
                  transition={{ duration: 0.7, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="group glass border border-white/12 rounded-[28px] p-6 hover:border-white/20 transition-colors"
                >
                  <Link
                    href={`/prodotti/${encodeURIComponent(String(p?.slug || p?.sku || ''))}`}
                    className="block relative aspect-square rounded-2xl overflow-hidden bg-white/3 border border-white/10"
                    aria-label={`Apri dettagli: ${String(p?.name || 'Prodotto')}`}
                  >
                    <MediaCarousel
                      images={getImageUrls(p, '/bici1.jpg')}
                      alt={p.name || 'Prodotto'}
                      sizes="(max-width: 768px) 92vw, (max-width: 1024px) 46vw, 22vw"
                      className="absolute inset-0"
                      imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      objectPosition="50% 50%"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.00)_40%,rgba(5,6,8,0.72)_100%)]" />
                  </Link>
                  <div className="mt-5 flex items-start justify-between gap-3">
                    <Link
                      href={`/prodotti/${encodeURIComponent(String(p?.slug || p?.sku || ''))}`}
                      className="text-white font-extrabold tracking-tight hover:underline"
                    >
                      {p.name || 'Prodotto'}
                    </Link>
                    {(() => {
                      const base =
                        typeof (p as any).priceEur === 'number'
                          ? euro.format(Number((p as any).priceEur))
                          : p.price
                            ? String(p.price)
                            : null
                      const sale =
                        typeof (p as any).salePriceEur === 'number'
                          ? euro.format(Number((p as any).salePriceEur))
                          : (p as any).salePrice
                            ? String((p as any).salePrice)
                            : null
                      if (!base && !sale) return null
                      return sale ? (
                        <div className="text-right">
                          {base && <div className="text-white/45 text-xs line-through font-semibold">{base}</div>}
                          <div className="text-white font-extrabold">{sale}</div>
                        </div>
                      ) : (
                        <div className="text-white/80 font-bold">{base}</div>
                      )
                    })()}
                  </div>
                  {(() => {
                    const brand = String((p as any).brand ?? '').trim()
                    const gender = String((p as any).gender ?? '').trim()
                    if (!brand && !gender) return null
                    const genderLabel = gender === 'uomo' ? 'Uomo' : gender === 'donna' ? 'Donna' : gender === 'unisex' ? 'Unisex' : gender
                    return (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {brand && (
                          <div className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/75 text-xs font-semibold">
                            {brand}
                          </div>
                        )}
                        {genderLabel && (
                          <div className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/75 text-xs font-semibold">
                            {genderLabel}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  <div className="mt-3 text-white/65 text-sm leading-relaxed line-clamp-3">
                    {String((p as any).fullDescription || p.description || '').trim()}
                  </div>
                  {Array.isArray((p as any).extensions) && (p as any).extensions.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {((p as any).extensions as any[]).slice(0, 3).map((ext, extIdx) => (
                        <div
                          key={`${ext?.label ?? 'ext'}-${extIdx}`}
                          className="flex items-start justify-between gap-4 rounded-2xl bg-white/4 border border-white/10 px-4 py-3"
                        >
                          <div className="text-white/75 font-semibold text-sm">{String(ext?.label ?? '')}</div>
                          <div className="text-white/55 font-semibold text-sm text-right">{String(ext?.value ?? '')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.sizes.slice(0, 6).map((s: any) => (
                        <div
                          key={String(s)}
                          className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold"
                        >
                          {String(s)}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5">
                    <div className="grid grid-cols-1 gap-3">
                      {(() => {
                        const key = String((p as any).slug || (p as any).sku || '').trim()
                        const href = key ? `/prodotti/${encodeURIComponent(key)}` : '#contatti'
                        return (
                          <MagneticButton href={href} className="btn-primary w-full px-5 py-4 font-bold">
                            Dettagli
                            <ArrowRight className="w-5 h-5" />
                          </MagneticButton>
                        )
                      })()}
                      <MagneticButton href="#contatti" className="btn-secondary w-full px-5 py-4 font-bold border border-white/12">
                        Richiedi disponibilità
                        <ArrowRight className="w-5 h-5" />
                      </MagneticButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="riparazioni" data-hscroll className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_540px_at_10%_30%,rgba(0,245,255,0.10),transparent_60%),radial-gradient(900px_540px_at_90%_40%,rgba(163,255,0,0.08),transparent_60%)]" />
        <div className="relative z-10">
          <div id="servizi" className="sr-only" />
          <div id="officina" className="sr-only" />
          <div id="tecnologia" className="sr-only" />
          <div className="container mx-auto px-6 pt-24 md:pt-28">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Riparazioni</div>
              <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
                Riparazioni e <span className="text-gradient">manutenzione</span>
              </h2>
              <p className="mt-4 text-white/65 max-w-2xl">
                Interventi su bici muscolari e a pedalata assistita: diagnosi, messa a punto e ricambistica su richiesta.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 h-[74vh] md:h-[76vh]">
            <div data-track className="h-full flex gap-6 md:gap-8 px-6 md:px-20">
              {repairs.map((s, i) => (
                <div key={String(s.id ?? s.title)} className="h-full w-[82vw] sm:w-[68vw] md:w-[640px] flex-none">
                  <TiltCard className="h-full">
                    <div className="relative h-full rounded-[32px] overflow-hidden border border-white/12 bg-white/2">
                      <Image
                        src={`/${(i % 6) + 1}.jpg`}
                        alt={s.title}
                        fill
                        sizes="(max-width: 768px) 82vw, 640px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.15)_0%,rgba(5,6,8,0.86)_72%)]" />
                      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-white/65 text-xs tracking-widest uppercase font-semibold">
                              {String(s.category ?? 'Riparazioni')}
                            </div>
                            <div className="mt-2 text-white text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                              {s.title}
                            </div>
                          </div>
                          <div className="glass border border-white/12 rounded-2xl px-4 py-3">
                            <div className="text-white/60 text-[10px] tracking-widest uppercase font-semibold">Prenotazione</div>
                            <div className="text-white font-extrabold text-lg">Su richiesta</div>
                          </div>
                        </div>

                        <div>
                          <div className="rounded-2xl bg-white/4 border border-white/10 p-6">
                            <div className="text-white/75 leading-relaxed">{s.desc}</div>
                            {Array.isArray(s.bullets) && s.bullets.length > 0 && (
                              <div className="mt-5 flex flex-wrap gap-2">
                                {s.bullets.map((b: string) => (
                                  <div
                                    key={b}
                                    className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold"
                                  >
                                    {b}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-5 flex flex-col sm:flex-row gap-3">
                            <MagneticButton href="#contatti" className="btn-primary px-6 py-4 font-bold flex-1">
                              Richiedi assistenza
                              <ArrowRight className="w-5 h-5" />
                            </MagneticButton>
                            <MagneticButton href="#gallery" className="btn-secondary px-6 py-4 font-bold border border-white/12">
                              Vedi l'officina
                              <Play className="w-5 h-5" />
                            </MagneticButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-6 pb-10">
            <div className="text-white/50 text-xs">
              Tip: su desktop passa il mouse sulle card per un tilt 3D. Su mobile, scorri orizzontalmente.
            </div>
          </div>
        </div>
      </section>

      <section id="perche" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Perché VincenzoBike</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Cura che <span className="text-gradient">si sente</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              Un’officina pensata per farti tornare in sella con serenità: diagnosi, manutenzione e riparazioni con attenzione ai dettagli.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div
              initial="hidden"
              whileInView="show"
              variants={reveal}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-7 glass border border-white/12 rounded-[32px] p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(650px_320px_at_20%_20%,rgba(0,245,255,0.14),transparent_70%),radial-gradient(650px_320px_at_80%_70%,rgba(163,255,0,0.10),transparent_70%)]" />
              <div className="relative">
                <div className="flex items-center gap-3 text-white font-bold">
                  <Sparkles className="w-5 h-5 text-[rgb(0,245,255)]" />
                  Premium by design
                </div>
                <div className="mt-4 text-white/70 leading-relaxed">
                  Linee pulite, integrazione invisibile, componenti selezionati. Un’estetica che comunica tecnologia senza urlarla.
                </div>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: <Wrench className="w-4 h-4 text-[rgb(163,255,0)]" />, title: 'Riparazioni', desc: 'Freni · cambio · ruote · forature.' },
                    { icon: <Check className="w-4 h-4 text-[rgb(0,245,255)]" />, title: 'Manutenzione', desc: 'Check-up · regolazioni · sicurezza.' },
                    { icon: <Home className="w-4 h-4 text-white/70" />, title: 'A domicilio', desc: 'Interventi su richiesta.' },
                    { icon: <ShoppingBag className="w-4 h-4 text-white/70" />, title: 'Accessori e ricambi', desc: 'Vendita · gadget · ordini specifici.' },
                  ].map((f) => (
                    <div key={f.title} className="rounded-2xl bg-white/4 border border-white/10 p-4">
                      <div className="flex items-center gap-2 text-white/90 font-semibold">
                        {f.icon}
                        {f.title}
                      </div>
                      <div className="mt-2 text-white/60 text-sm">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="md:col-span-5 grid grid-cols-1 gap-6">
              {(data as any).features.slice(0, 2).map((f: any) => (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="show"
                  variants={reveal}
                  viewport={{ once: true, margin: '-120px' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="glass border border-white/12 rounded-[32px] p-7 md:p-8 hover:border-white/20 transition-colors"
                >
                  <div className="text-white font-bold">{f.title}</div>
                  <div className="mt-3 text-white/65 leading-relaxed">{f.desc}</div>
                  <div className="mt-6 inline-flex items-center gap-2 text-white/70 text-sm font-semibold">
                    <Check className="w-4 h-4 text-[rgb(163,255,0)]" />
                    Standard di qualità automotive
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data as any).features.slice(2).map((f: any, idx: number) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.7, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="glass border border-white/12 rounded-[32px] p-7 md:p-8 hover:border-white/20 transition-colors"
              >
                <div className="text-white font-bold">{f.title}</div>
                <div className="mt-3 text-white/65 leading-relaxed">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Officina</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Dentro l’<span className="text-gradient">officina</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              Una selezione di immagini e dettagli: attrezzatura, componenti e lavori di manutenzione.
            </p>
          </motion.div>

          <div className="mt-14 columns-2 md:columns-3 gap-4 md:gap-6">
            {gallery.map((item, idx) => {
              const src = toImageUrl(item, 'portrait_4_3') ?? '/bici1.jpg'
              const aspect =
                idx % 6 === 0
                  ? 'aspect-[4/5]'
                  : idx % 6 === 1
                    ? 'aspect-[16/10]'
                    : idx % 6 === 2
                      ? 'aspect-[3/4]'
                      : idx % 6 === 3
                        ? 'aspect-[1/1]'
                        : idx % 6 === 4
                          ? 'aspect-[9/16]'
                          : 'aspect-[5/4]'
              return (
                <motion.div
                  key={`${src}-${idx}`}
                  initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-120px' }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 md:mb-6 break-inside-avoid"
                >
                  <div
                    className={`relative ${aspect} rounded-[28px] overflow-hidden border border-white/12 bg-white/3 group`}
                  >
                    <Image
                      src={src}
                      alt="Officina biciclette"
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.10),rgba(5,6,8,0.55))] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="testimonial" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_50%_10%,rgba(0,245,255,0.08),transparent_60%)]" />
        <div className="relative container mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Testimonial</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Persone. Storie. <span className="text-gradient">Libertà.</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              Esperienze reali: riparazioni puntuali, manutenzione accurata e supporto su richiesta anche a domicilio.
            </p>
          </motion.div>

          <div className="mt-12 -mx-6 px-6 overflow-x-auto snap-x snap-mandatory">
            <div className="flex gap-6 pb-6 min-w-max">
              {((data as any).testimonials as any[]).map((t) => (
                <div
                  key={t.name}
                  className="snap-center w-[86vw] sm:w-[520px] glass border border-white/12 rounded-[32px] p-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{t.name}</div>
                      <div className="text-white/60 text-sm">{t.role}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[rgb(0,245,255)] text-[rgb(0,245,255)]" />
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 text-white/75 leading-relaxed text-lg">“{t.quote}”</div>
                  <div className="mt-8 flex items-center gap-2 text-white/55 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 text-[rgb(163,255,0)]" />
                    Verificato · Clienti VincenzoBike
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contatti" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Contatti</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Vieni in <span className="text-gradient">officina</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              {`Siamo in ${(data as any).footer.address}. Aperto dal lunedì al sabato dalle 09:00 alle 20:00 (domenica chiuso). Riparazioni a domicilio su richiesta. Pompa per gonfiaggio ruote disponibile gratuitamente.`}
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 glass border border-white/12 rounded-[32px] p-8 md:p-10">
              <div className="text-white font-bold">Cosa trovi da VincenzoBike</div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Wrench className="w-4 h-4 text-[rgb(163,255,0)]" />,
                    title: 'Manutenzione e riparazioni',
                    desc: 'Bici muscolari, elettriche e a pedalata assistita.',
                  },
                  {
                    icon: <Home className="w-4 h-4 text-[rgb(0,245,255)]" />,
                    title: 'Riparazioni a domicilio',
                    desc: 'Disponibile su richiesta, in base al tipo di intervento.',
                  },
                  {
                    icon: <Check className="w-4 h-4 text-white/80" />,
                    title: 'Pompa gratuita',
                    desc: 'Gonfiaggio ruote disponibile gratuitamente in officina.',
                  },
                  {
                    icon: <ShoppingBag className="w-4 h-4 text-white/80" />,
                    title: 'Accessori e ricambi',
                    desc: 'Vendita gadget e possibilità di ordinare ricambistica specifica.',
                  },
                ].map((c) => (
                  <div key={c.title} className="rounded-2xl bg-white/4 border border-white/10 p-6">
                    <div className="flex items-center gap-2 text-white/90 font-semibold">
                      {c.icon}
                      {c.title}
                    </div>
                    <div className="mt-2 text-white/65 leading-relaxed">{c.desc}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary px-7 py-4 font-bold rounded-2xl inline-flex items-center justify-center gap-2"
                >
                  Apri in Maps
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${(data as any).footer.email}`}
                  className="btn-secondary px-7 py-4 font-bold rounded-2xl inline-flex items-center justify-center gap-2 border border-white/12"
                >
                  Scrivici
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 glass border border-white/12 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(650px_340px_at_40%_20%,rgba(0,245,255,0.12),transparent_70%),radial-gradient(650px_340px_at_70%_70%,rgba(163,255,0,0.10),transparent_72%)]" />
              <div className="relative">
                <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Indirizzo</div>
                <div className="mt-3 text-white text-2xl md:text-3xl font-extrabold tracking-tight font-display">
                  {(data as any).footer.address}
                </div>

                <div className="mt-8 rounded-2xl bg-white/4 border border-white/10 p-6">
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between text-white/80 text-sm font-semibold">
                    <div>Email</div>
                    <div className="text-white break-words">{(data as any).footer.email}</div>
                  </div>
                  <div className="mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between text-white/80 text-sm font-semibold">
                    <div>Telefono</div>
                    <div className="text-white break-words">{(data as any).footer.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5">
              <div className="font-display text-2xl font-extrabold tracking-tight text-white">
                Vincenzo<span className="text-gradient">Bike</span>
              </div>
              <div className="mt-3 text-white/60 max-w-md">
                Assistenza, manutenzione e riparazioni per bici muscolari, elettriche e a pedalata assistita. Su richiesta,
                riparazioni a domicilio e pompa gratuita in officina.
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <div className="text-white font-bold">Esplora</div>
                <div className="mt-4 flex flex-col gap-3 text-white/65 font-semibold">
                  {[
                    { label: 'Riparazioni', id: 'riparazioni' },
                    { label: 'Catalogo', id: 'prodotti' },
                    { label: 'Gallery', id: 'gallery' },
                    { label: 'Contatti', id: 'contatti' },
                  ].map((l) => (
                    <a key={l.id} href={`#${l.id}`} className="hover:text-white transition-colors">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-white font-bold">Contatti</div>
                <div className="mt-4 flex flex-col gap-2 text-white/65 font-semibold">
                  <div>{(data as any).footer.address}</div>
                  <div>{(data as any).footer.phone}</div>
                  <div>{(data as any).footer.email}</div>
                </div>
              </div>
              <div>
                <div className="text-white font-bold">Newsletter</div>
                <div className="mt-4 text-white/60 text-sm">Novità e promozioni VincenzoBike.</div>
                <div className="mt-4 flex flex-col lg:flex-row gap-3">
                  <input
                    className="h-12 w-full min-w-0 rounded-2xl bg-white/4 border border-white/10 px-4 text-white placeholder:text-white/35 outline-none focus:border-white/20"
                    placeholder="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                  />
                  <button className="tap-target h-12 px-5 rounded-2xl inline-flex items-center justify-center bg-[#A3FF00] text-black shadow-lg active:scale-95 transition-all duration-300 font-bold whitespace-nowrap">
                    Iscriviti
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white/45 text-xs">
            <div>© {new Date().getFullYear()} VincenzoBike. Tutti i diritti riservati.</div>
            <div className="flex items-center gap-4">
              {(data as any).footer.social.map((s: any) => (
                <a key={s.label} href={s.href} className="hover:text-white/70 transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
