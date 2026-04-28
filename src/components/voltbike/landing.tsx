'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BatteryCharging,
  Check,
  Cpu,
  MapPinned,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Weight,
} from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { TiltCard } from '@/components/tilt-card'
import { CursorGlow } from '@/components/voltbike/cursor-glow'
import { MagneticButton } from '@/components/voltbike/magnetic-button'
import data from '@/data.json'

gsap.registerPlugin(ScrollTrigger)

const reveal = {
  hidden: { opacity: 0, y: 18, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

function formatEUR(value: number) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function parseEUR(value: string) {
  return Number(value.replace(/[^\d]/g, ''))
}

export function VoltbikeLanding() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const models = (data as any).models as Array<any>
  const [modelId, setModelId] = useState(models?.[0]?.id ?? 'urban')
  const selectedModel = models.find((m) => m.id === modelId) ?? models?.[0]
  const [color, setColor] = useState<'Graphite' | 'Electric Blue' | 'Lime'>('Graphite')
  const [battery, setBattery] = useState<'Standard' | 'Extended'>('Standard')
  const [acc, setAcc] = useState({ rack: true, lights: true, tracker: false })

  const basePrice = selectedModel ? parseEUR(selectedModel.price) : 0
  const batteryDelta = battery === 'Extended' ? 290 : 0
  const accDelta = (acc.rack ? 120 : 0) + (acc.lights ? 70 : 0) + (acc.tracker ? 90 : 0)
  const totalPrice = basePrice + batteryDelta + accDelta

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

  return (
    <div ref={rootRef} className="min-h-screen overflow-x-hidden bg-noise">
      <CursorGlow />
      <Navbar />

      <section id="hero" className="relative min-h-[100svh] pt-28 md:pt-32">
        <div className="absolute inset-0">
          <Image
            src="/bici1.jpg"
            alt="Bici elettrica premium VOLTBIKE"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-40"
          />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_20%,rgba(0,245,255,0.12),transparent_62%),radial-gradient(900px_600px_at_90%_45%,rgba(163,255,0,0.10),transparent_60%),linear-gradient(180deg,rgba(5,6,8,0.40),rgba(5,6,8,0.92))]" />
          <div className="absolute inset-0 grid-overlay opacity-70" />
          <div className="absolute inset-0 scanline" />
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/12 text-white/80 text-xs tracking-widest uppercase font-semibold">
                <span className="h-2 w-2 rounded-full bg-[rgb(0,245,255)] shadow-[0_0_18px_rgba(0,245,255,0.55)]" />
                Design italiano · tecnologia connessa · performance silenziosa
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
                <MagneticButton href="#modelli" className="btn-primary px-7 py-4 font-bold">
                  Scegli il tuo modello
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
                <MagneticButton href="#gallery" className="btn-secondary px-7 py-4 font-bold border border-white/12">
                  Guarda il video
                  <Play className="w-5 h-5" />
                </MagneticButton>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-3 max-w-xl">
                {(data as any).kpis.map((k: any) => (
                  <div key={k.label} className="hero-kpi glass border border-white/10 rounded-2xl px-4 py-4">
                    <div className="text-white text-xl md:text-2xl font-extrabold tracking-tight">{k.value}</div>
                    <div className="text-white/60 text-xs tracking-wide uppercase mt-1">{k.label}</div>
                  </div>
                ))}
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
                  <div className="text-white font-bold tracking-tight">VOLTBIKE Control</div>
                  <div className="text-white/50 text-xs font-semibold">SmartRide OS</div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <BatteryCharging className="w-4 h-4 text-[rgb(163,255,0)]" />
                      Batteria
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">720Wh</div>
                    <div className="text-white/55 text-xs mt-1">Removibile · Fast charge</div>
                  </div>
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <Cpu className="w-4 h-4 text-[rgb(0,245,255)]" />
                      Motore
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">85Nm</div>
                    <div className="text-white/55 text-xs mt-1">Centrale · Silenzioso</div>
                  </div>
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <Smartphone className="w-4 h-4 text-white/70" />
                      App
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">Live</div>
                    <div className="text-white/55 text-xs mt-1">Tracking · Diagnostica</div>
                  </div>
                  <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                    <div className="flex items-center gap-2 text-white/85 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-white/70" />
                      Sicurezza
                    </div>
                    <div className="mt-2 text-white text-2xl font-extrabold">Guard</div>
                    <div className="text-white/55 text-xs mt-1">Anti-furto · SOS</div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[radial-gradient(500px_260px_at_30%_20%,rgba(0,245,255,0.18),transparent_60%),radial-gradient(500px_260px_at_70%_60%,rgba(163,255,0,0.12),transparent_65%)] border border-white/10 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white/80 text-sm font-semibold">Modalità assistenza</div>
                    <div className="text-white/60 text-xs">Eco · Sport · Boost</div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full w-[72%] bg-[linear-gradient(90deg,rgba(0,245,255,0.95),rgba(163,255,0,0.9))]" />
                    </div>
                    <div className="text-white font-bold text-sm">Boost</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-16 text-white/55 text-xs tracking-widest uppercase font-semibold">
            Scorri per esplorare · <span className="text-white/80">UI premium, animazioni fluide, feel futuristico</span>
          </div>
        </div>
      </section>

      <section id="modelli" data-hscroll className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(900px_540px_at_10%_30%,rgba(0,245,255,0.10),transparent_60%),radial-gradient(900px_540px_at_90%_40%,rgba(163,255,0,0.08),transparent_60%)]" />
        <div className="relative z-10">
          <div className="container mx-auto px-6 pt-24 md:pt-28">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Modelli</div>
              <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
                Scegli la tua <span className="text-gradient">traiettoria</span>
              </h2>
              <p className="mt-4 text-white/65 max-w-2xl">
                Urban, Mountain, Cargo, Folding. Quattro anime, un solo obiettivo: portarti più lontano con meno sforzo.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 h-[74vh] md:h-[76vh]">
            <div data-track className="h-full flex gap-6 md:gap-8 px-6 md:px-20">
              {models.map((m) => (
                <div key={m.id} className="h-full w-[82vw] sm:w-[68vw] md:w-[640px] flex-none">
                  <TiltCard className="h-full">
                    <div className="relative h-full rounded-[32px] overflow-hidden border border-white/12 bg-white/2">
                      <Image
                        src={m.image}
                        alt={`${m.name} e-bike`}
                        fill
                        sizes="(max-width: 768px) 82vw, 640px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.15)_0%,rgba(5,6,8,0.86)_72%)]" />
                      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-white/65 text-xs tracking-widest uppercase font-semibold">{m.category}</div>
                            <div className="mt-2 text-white text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                              {m.name}
                            </div>
                          </div>
                          <div className="glass border border-white/12 rounded-2xl px-4 py-3">
                            <div className="text-white/60 text-[10px] tracking-widest uppercase font-semibold">Da</div>
                            <div className="text-white font-extrabold text-lg">{m.price}</div>
                          </div>
                        </div>

                        <div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                                <BatteryCharging className="w-4 h-4 text-[rgb(163,255,0)]" />
                                Autonomia
                              </div>
                              <div className="mt-2 text-white font-extrabold text-xl">{m.rangeKm}km</div>
                            </div>
                            <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                                <Weight className="w-4 h-4 text-white/70" />
                                Peso
                              </div>
                              <div className="mt-2 text-white font-extrabold text-xl">18–23kg</div>
                            </div>
                            <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                                <MapPinned className="w-4 h-4 text-[rgb(0,245,255)]" />
                                Max
                              </div>
                              <div className="mt-2 text-white font-extrabold text-xl">{m.topSpeed}</div>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col sm:flex-row gap-3">
                            <MagneticButton
                              href="#configura"
                              onClick={() => setModelId(m.id)}
                              className="btn-primary px-6 py-4 font-bold flex-1"
                            >
                              Configura {m.name}
                              <ArrowRight className="w-5 h-5" />
                            </MagneticButton>
                            <MagneticButton href="#tecnologia" className="btn-secondary px-6 py-4 font-bold border border-white/12">
                              Dettagli tech
                              <Cpu className="w-5 h-5" />
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
              Tip: su desktop passa il mouse sulle card per un tilt 3D. Su mobile, scorri e tocca per configurare.
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
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Perché VOLTBIKE</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Tecnologia che <span className="text-gradient">si sente</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              Ogni dettaglio è pensato per velocità, libertà e controllo: materiali premium, integrazione smart e un’estetica minimalista.
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
                    { icon: <BatteryCharging className="w-4 h-4 text-[rgb(163,255,0)]" />, title: 'Batteria removibile', desc: 'Sgancio rapido · ricarica ovunque.' },
                    { icon: <Cpu className="w-4 h-4 text-[rgb(0,245,255)]" />, title: 'Motore centrale', desc: 'Coppia naturale · silenzioso.' },
                    { icon: <Smartphone className="w-4 h-4 text-white/70" />, title: 'App Companion', desc: 'Mappe · anti-furto · diagnostica.' },
                    { icon: <ShieldCheck className="w-4 h-4 text-white/70" />, title: 'Sicurezza', desc: 'Tracking · luci auto · freni a disco.' },
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

      <section id="tecnologia" data-hscroll className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%,rgba(255,255,255,0.02))]" />
        <div className="relative z-10">
          <div className="container mx-auto px-6 pt-24 md:pt-28">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Tecnologia</div>
              <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
                Potenza. Sensori. <span className="text-gradient">Intelligenza.</span>
              </h2>
              <p className="mt-4 text-white/65 max-w-2xl">
                Batterie, motore e software lavorano insieme: un’esperienza fluida e naturale, con un parallax leggero e un racconto tecnico premium.
              </p>
            </motion.div>
          </div>

          <div className="mt-12 h-[72vh] md:h-[74vh]">
            <div data-track className="h-full flex gap-6 md:gap-8 px-6 md:px-20">
              {(data as any).technology.map((t: any) => (
                <div key={t.title} className="h-full w-[86vw] sm:w-[70vw] md:w-[720px] flex-none">
                  <div className="relative h-full rounded-[32px] overflow-hidden border border-white/12 bg-white/2">
                    <Image
                      src={t.image}
                      alt={t.title}
                      fill
                      sizes="(max-width: 768px) 86vw, 720px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.18)_0%,rgba(5,6,8,0.88)_74%)]" />
                    <div className="absolute inset-0 p-7 md:p-10 flex flex-col justify-end">
                      <div className="text-white/65 text-xs tracking-widest uppercase font-semibold">VOLTBIKE Labs</div>
                      <div className="mt-3 text-white text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                        {t.title}
                      </div>
                      <div className="mt-4 text-white/70 leading-relaxed max-w-xl">{t.desc}</div>
                      <div className="mt-7 flex flex-wrap gap-2">
                        {[
                          'Ottimizzazione cicli',
                          'Diagnostica real-time',
                          'Aggiornamenti OTA',
                          'Sensori torque/cadenza',
                        ].map((tag) => (
                          <div
                            key={tag}
                            className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-6 pb-10">
            <div className="text-white/50 text-xs">
              Questa sezione usa scroll orizzontale guidato dallo scroll verticale (pin + scrub).
            </div>
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
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Esperienza di guida</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Cinematica. Reale. <span className="text-gradient">VOLT.</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              Lifestyle, commuting, trail e viaggi: immagini realistiche con luce “premium” in stile Unsplash/Pexels.
            </p>
          </motion.div>

          <div className="mt-14 columns-2 md:columns-3 gap-4 md:gap-6">
            {((data as any).gallery as string[]).map((src, idx) => {
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
                  key={src}
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
                      alt="Esperienza di guida VOLTBIKE"
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
              Recensioni ad alta fiducia: qualità percepita, comfort e tecnologia che semplifica la vita.
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
                    Verificato · VOLTBIKE Owners Club
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="configura" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Configuratore</div>
            <h2 className="mt-3 font-display font-extrabold tracking-tight text-4xl md:text-6xl">
              Inizia il tuo <span className="text-gradient">viaggio</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-2xl">
              Un configuratore semplice e veloce: scegli modello, colore, batteria e accessori. Prezzo aggiornato in tempo reale.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 glass border border-white/12 rounded-[32px] p-8 md:p-10">
              <div className="text-white font-bold">Modello</div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelId(m.id)}
                    className={`tap-target px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                      modelId === m.id
                        ? 'border-white/20 bg-white/10 text-white'
                        : 'border-white/10 bg-white/4 text-white/70 hover:text-white hover:bg-white/6'
                    }`}
                  >
                    {m.id === 'urban' ? 'Urban' : m.id === 'mountain' ? 'Mountain' : m.id === 'cargo' ? 'Cargo' : 'Folding'}
                  </button>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-white font-bold">Colore</div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {([
                      { label: 'Graphite', chip: 'bg-white/10 border-white/12' },
                      { label: 'Electric Blue', chip: 'bg-[rgba(0,245,255,0.14)] border-[rgba(0,245,255,0.30)]' },
                      { label: 'Lime', chip: 'bg-[rgba(163,255,0,0.14)] border-[rgba(163,255,0,0.30)]' },
                    ] as const).map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setColor(c.label)}
                        className={`tap-target px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                          color === c.label ? `text-white ${c.chip}` : 'border-white/10 bg-white/4 text-white/70 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-white font-bold">Batteria</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {([
                      { label: 'Standard', desc: '540Wh' },
                      { label: 'Extended', desc: '720Wh (+€290)' },
                    ] as const).map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBattery(b.label)}
                        className={`tap-target px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                          battery === b.label
                            ? 'border-white/20 bg-white/10 text-white'
                            : 'border-white/10 bg-white/4 text-white/70 hover:text-white hover:bg-white/6'
                        }`}
                      >
                        <div>{b.label}</div>
                        <div className="text-[11px] text-white/60 font-semibold mt-1">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-white font-bold">Accessori</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { k: 'rack', label: 'Portapacchi', price: 120 },
                    { k: 'lights', label: 'Luci smart', price: 70 },
                    { k: 'tracker', label: 'Tracker GPS', price: 90 },
                  ].map((a) => (
                    <button
                      key={a.k}
                      type="button"
                      onClick={() => setAcc((p) => ({ ...p, [a.k]: !(p as any)[a.k] }))}
                      className={`tap-target px-4 py-3 rounded-2xl border text-sm font-bold transition-colors ${
                        (acc as any)[a.k]
                          ? 'border-white/20 bg-white/10 text-white'
                          : 'border-white/10 bg-white/4 text-white/70 hover:text-white hover:bg-white/6'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>{a.label}</div>
                        <div className="text-white/60 text-xs font-semibold">+€{a.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 glass border border-white/12 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(650px_340px_at_40%_20%,rgba(0,245,255,0.12),transparent_70%),radial-gradient(650px_340px_at_70%_70%,rgba(163,255,0,0.10),transparent_72%)]" />
              <div className="relative">
                <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Riepilogo</div>
                <div className="mt-3 text-white text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                  {selectedModel?.name ?? 'VOLTBIKE'}
                </div>
                <div className="mt-2 text-white/65">{selectedModel?.category}</div>

                <div className="mt-8 rounded-2xl bg-white/4 border border-white/10 p-6">
                  <div className="flex items-center justify-between text-white/80 text-sm font-semibold">
                    <div>Colore</div>
                    <div className="text-white">{color}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-white/80 text-sm font-semibold">
                    <div>Batteria</div>
                    <div className="text-white">{battery === 'Extended' ? 'Extended 720Wh' : 'Standard 540Wh'}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-white/80 text-sm font-semibold">
                    <div>Accessori</div>
                    <div className="text-white">
                      {(acc.rack ? 1 : 0) + (acc.lights ? 1 : 0) + (acc.tracker ? 1 : 0)} selezionati
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-6">
                  <div>
                    <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Prezzo stimato</div>
                    <div className="mt-2 text-white text-4xl font-extrabold tracking-tight">{formatEUR(totalPrice)}</div>
                  </div>
                  <div className="text-right text-white/55 text-xs">
                    IVA inclusa · consegna da 7–14 giorni · configurazione salvabile
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <MagneticButton className="btn-primary px-7 py-4 font-bold">
                    Prenota una prova
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
                  <MagneticButton className="btn-secondary px-7 py-4 font-bold border border-white/12">
                    Scarica brochure
                    <ArrowRight className="w-5 h-5" />
                  </MagneticButton>
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
                VOLT<span className="text-gradient">BIKE</span>
              </div>
              <div className="mt-3 text-white/60 max-w-md">
                Brand premium di e-bike: velocità, libertà e tecnologia. Design minimal con dettagli futuristici.
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <div className="text-white font-bold">Esplora</div>
                <div className="mt-4 flex flex-col gap-3 text-white/65 font-semibold">
                  {[
                    { label: 'Modelli', id: 'modelli' },
                    { label: 'Tecnologia', id: 'tecnologia' },
                    { label: 'Configuratore', id: 'configura' },
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
                <div className="mt-4 text-white/60 text-sm">Offerte e novità VOLTBIKE.</div>
                <div className="mt-4 flex gap-3">
                  <input
                    className="h-12 w-full rounded-2xl bg-white/4 border border-white/10 px-4 text-white placeholder:text-white/35 outline-none focus:border-white/20"
                    placeholder="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                  />
                  <button className="tap-target h-12 px-5 rounded-2xl btn-primary font-bold">
                    Iscriviti
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white/45 text-xs">
            <div>© {new Date().getFullYear()} VOLTBIKE. Tutti i diritti riservati.</div>
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

