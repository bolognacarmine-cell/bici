'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Bike, Shield, Wrench, Settings, ShoppingBag, PhoneCall, MapPin, Clock, ArrowRight, Star, ChevronRight, Send } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { TiltCard } from '@/components/tilt-card'
import { AIChatbot } from '@/components/chatbot'
import data from '@/data.json'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const heroRef = useRef(null)
  const historyRef = useRef(null)
  const servicesRef = useRef(null)
  const whyRef = useRef(null)

  useEffect(() => {
    // Hero Animations
    const heroTl = gsap.timeline()
    heroTl.fromTo('.hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ease: 'power4.out' })
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.hero-cta', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3')

    // Section Headers
    gsap.utils.toArray('.section-header').forEach((header: any) => {
      gsap.fromTo(header, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, y: 0, 
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
          }
        }
      )
    })

    // Cards staggered animation
    gsap.fromTo('.service-card', 
      { opacity: 0, y: 40, scale: 0.95 },
      { 
        opacity: 1, y: 0, scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 80%',
        }
      }
    )
  }, [])

  const hapticFeedback = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50) // Optimized for 2026 Mobile Trends
    }
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-500 overflow-x-hidden">
      <Navbar />
      <AIChatbot />

      {/* Promozioni Section (New) */}
      {data.promotions && data.promotions.length > 0 && (
        <section id="promozioni" className="pt-32 pb-16 bg-bg-light dark:bg-bg-dark">
          <div className="container mx-auto px-6">
            <div className="section-header text-center mb-12">
              <span className="text-secondary-start font-bold uppercase tracking-widest text-sm mb-4 block">Offerte Speciali</span>
              <h2 className="text-4xl font-display font-bold">Promozioni in <span className="text-gradient-orange">Corso</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.promotions.map((promo: any, idx: number) => (
                <div key={idx} className="glass dark:glass-dark rounded-[32px] overflow-hidden flex flex-col md:flex-row border border-white/20 group">
                  <div className="md:w-1/2 relative h-64 md:h-auto">
                    <Image src={promo.image} alt={promo.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">{promo.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">{promo.description}</p>
                    <button className="btn-secondary px-6 py-3 rounded-xl font-bold self-start">Approfittane Ora</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-start/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-secondary-start/10 rounded-full blur-[150px] animate-pulse delay-700" />
          <Image
            src="/bici1.jpg"
            alt="Vincenzo Ciclofficina"
            fill
            className="object-cover opacity-30 dark:opacity-20 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-1000"
            priority
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-secondary-start animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">Trend 2026: Ciclofficina 2.0</span>
          </motion.div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-display font-extrabold mb-8 leading-tight tracking-tighter">
            {data.hero.title.split('\n').map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? <span className="text-gradient">{line}</span> : line}
              </span>
            ))}
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl font-light mb-12 text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            {data.hero.subtitle}
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={hapticFeedback}
              className="px-10 py-5 btn-primary rounded-2xl font-bold flex items-center gap-3 group text-lg shadow-2xl shadow-primary-start/30"
            >
              Prenota Revisione
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={hapticFeedback}
              className="px-10 py-5 glass dark:glass-dark rounded-2xl font-bold hover:bg-white/10 dark:hover:bg-zinc-800 transition-all text-lg"
            >
              Scopri la Storia
            </button>
          </div>
        </div>
      </section>

      {/* La Storia Section */}
      <section id="storia" ref={historyRef} className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                   <TiltCard className="h-[600px] overflow-hidden group shadow-3xl">
                      <Image 
                        src="/bici1.jpg" 
                        alt="Storia" 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                         <div className="flex gap-4 mb-4">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-secondary-start text-secondary-start" />)}
                         </div>
                         <h3 className="text-3xl font-bold text-white mb-2">40 Anni di Esperienza</h3>
                         <p className="text-white/70">Dalla passione di Vincenzo all'innovazione dei figli.</p>
                      </div>
                   </TiltCard>
                </div>
                <div className="order-1 lg:order-2">
                   <div className="section-header mb-12">
                      <span className="text-gradient font-bold uppercase tracking-widest text-sm mb-4 block">La Nostra Eredità</span>
                      <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">{data.history.title}</h2>
                      <div className="space-y-8 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {data.history.content.map((p, idx) => (
                          <p key={idx} className={idx === 0 ? "text-2xl font-medium text-zinc-800 dark:text-zinc-200" : ""}>{p}</p>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Servizi Section */}
      <section id="servizi" ref={servicesRef} className="py-32 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-bg-light dark:from-bg-dark to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="section-header text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Servizi <span className="text-gradient">Professionali</span></h2>
            <p className="text-lg text-zinc-500">Combiniamo la precisione artigianale con le tecnologie diagnostiche più avanzate del 2026.</p>
          </div>

          <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.services.map((service, idx) => (
              <TiltCard key={idx} className="service-card group">
                <div className="h-full p-10 glass dark:glass-dark rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-primary-start/50 transition-all duration-500">
                  <div className="w-16 h-16 btn-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {idx === 0 && <Wrench className="w-8 h-8" />}
                    {idx === 1 && <Settings className="w-8 h-8" />}
                    {idx === 2 && <Shield className="w-8 h-8" />}
                    {idx === 3 && <Bike className="w-8 h-8" />}
                    {idx === 4 && <ShoppingBag className="w-8 h-8" />}
                    {idx === 5 && <ChevronRight className="w-8 h-8" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-display">{service.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">{service.desc}</p>
                  <button className="flex items-center gap-2 text-primary-start font-bold group/btn">
                    Dettagli
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogo Prodotti Section (New) */}
      {data.products && data.products.length > 0 && (
        <section id="prodotti" className="py-32 bg-bg-light dark:bg-bg-dark">
          <div className="container mx-auto px-6">
            <div className="section-header text-center mb-20">
              <span className="text-gradient font-bold uppercase tracking-widest text-sm mb-4 block">Shop Online</span>
              <h2 className="text-4xl md:text-6xl font-display font-bold">Il Nostro <span className="text-gradient">Catalogo</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.products.map((product: any, idx: number) => (
                <div key={idx} className="group relative glass dark:glass-dark rounded-3xl p-6 border border-white/20 hover:border-primary-start/50 transition-all duration-500">
                  <div className="aspect-square relative rounded-2xl overflow-hidden mb-6">
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold font-display">{product.name}</h3>
                    <span className="text-primary-start font-bold">{product.price}</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-6">{product.description}</p>
                  <button className="w-full py-3 glass dark:bg-zinc-800 rounded-xl font-bold text-sm hover:btn-primary transition-all duration-300">
                    Visualizza Prodotto
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Perché Sceglierci */}
      <section id="perche" ref={whyRef} className="py-32 relative">
        <div className="container mx-auto px-6">
           <div className="glass dark:glass-dark rounded-[40px] p-12 md:p-24 overflow-hidden relative border border-white/20">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-start/10 to-transparent pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div>
                    <h2 className="text-4xl md:text-6xl font-display font-bold mb-10 leading-tight">Perché Scegliere la Nostra <span className="text-gradient">Officina</span></h2>
                    <div className="space-y-10">
                       {[
                         { title: "Passione di Famiglia", desc: "Non siamo solo un'officina, siamo una storia che si tramanda da generazioni." },
                         { title: "Precisione 2026", desc: "Utilizziamo strumenti di precisione laser per ogni messa a punto." },
                         { title: "Consulenza AI", desc: "Analizziamo i tuoi dati di guida per consigliarti l'assetto perfetto." }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-6">
                            <div className="w-12 h-12 rounded-full bg-secondary-start/20 flex items-center justify-center flex-shrink-0">
                               <span className="text-secondary-start font-bold">{i+1}</span>
                            </div>
                            <div>
                               <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                               <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="relative h-[500px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-start/20 to-secondary-start/20 rounded-3xl blur-3xl animate-pulse" />
                    <TiltCard className="h-full bg-white dark:bg-zinc-900 rounded-3xl p-12 shadow-2xl flex flex-col justify-center items-center text-center">
                       <div className="text-8xl font-display font-black text-gradient mb-4">40+</div>
                       <div className="text-2xl font-bold uppercase tracking-widest text-zinc-400">Anni di Eccellenza</div>
                       <div className="mt-12 flex -space-x-4">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 overflow-hidden">
                               <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-500" />
                            </div>
                          ))}
                       </div>
                       <p className="mt-6 text-zinc-500">Oltre 10,000 ciclisti serviti a Marcianise.</p>
                    </TiltCard>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Contatti Section */}
      <section id="contatti" className="py-32 bg-bg-light dark:bg-bg-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="p-12 md:p-20 glass dark:glass-dark rounded-[40px] border border-white/20">
               <h2 className="text-4xl font-display font-bold mb-10">Vieni a <span className="text-gradient">Trovarci</span></h2>
               <div className="space-y-12">
                  <div className="flex gap-8">
                     <div className="w-16 h-16 rounded-2xl bg-primary-start/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="text-primary-start w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold mb-2 uppercase tracking-widest text-zinc-400 text-sm">Indirizzo</h4>
                        <p className="text-2xl font-medium">{data.contact.address}</p>
                     </div>
                  </div>
                  <div className="flex gap-8">
                     <div className="w-16 h-16 rounded-2xl bg-secondary-start/10 flex items-center justify-center flex-shrink-0">
                        <PhoneCall className="text-secondary-start w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold mb-2 uppercase tracking-widest text-zinc-400 text-sm">Telefono</h4>
                        <p className="text-2xl font-medium">{data.contact.phone}</p>
                     </div>
                  </div>
                  <div className="flex gap-8">
                     <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <Clock className="text-zinc-500 w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-xl font-bold mb-2 uppercase tracking-widest text-zinc-400 text-sm">Orari</h4>
                        {data.contact.hours.map((h, i) => <p key={i} className="text-xl font-medium">{h}</p>)}
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-12 md:p-20 glass dark:glass-dark rounded-[40px] border border-white/20 flex flex-col">
               <h2 className="text-4xl font-display font-bold mb-10">Scrivici</h2>
               <form className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <input type="text" placeholder="Nome" className="bg-white/50 dark:bg-black/20 border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-primary-start transition-all" />
                     <input type="email" placeholder="Email" className="bg-white/50 dark:bg-black/20 border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-primary-start transition-all" />
                  </div>
                  <textarea rows={5} placeholder="Il tuo messaggio..." className="w-full bg-white/50 dark:bg-black/20 border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-primary-start transition-all" />
                  <button className="w-full py-6 btn-secondary rounded-2xl font-bold text-xl shadow-xl shadow-secondary-start/20 flex items-center justify-center gap-3">
                     Invia Richiesta
                     <Send className="w-6 h-6" />
                  </button>
               </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-10 group cursor-pointer">
            <div className="w-12 h-12 btn-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Bike className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-display font-bold">Ciclofficina <span className="text-gradient">Vincenzo</span></span>
          </div>
          <p className="text-zinc-500 max-w-xl mx-auto mb-10">
            Dal 1980, la tua ciclofficina di fiducia a Marcianise. 
            Innovazione tecnologica e cuore artigianale per la tua passione su due ruote.
          </p>
          <div className="flex justify-center gap-10 text-zinc-400 font-bold mb-10 uppercase tracking-widest text-xs">
            <a href="#promozioni" className="hover:text-primary-start transition-colors">Promozioni</a>
            <a href="#storia" className="hover:text-primary-start transition-colors">Storia</a>
            <a href="#servizi" className="hover:text-primary-start transition-colors">Servizi</a>
            <a href="#prodotti" className="hover:text-primary-start transition-colors">Prodotti</a>
            <a href="/admin" className="hover:text-primary-start transition-colors">Admin</a>
          </div>
          <p className="text-zinc-400 text-sm">© 2026 Ciclofficina Vincenzo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
