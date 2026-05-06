import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[radial-gradient(900px_540px_at_10%_30%,rgba(0,245,255,0.10),transparent_60%),radial-gradient(900px_540px_at_90%_40%,rgba(163,255,0,0.08),transparent_60%)]">
      <div className="container mx-auto px-6 py-16">
        <div className="glass border border-white/12 rounded-[32px] p-8 md:p-10 max-w-2xl">
          <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">404</div>
          <h1 className="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-white">Pagina non trovata</h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            Il contenuto richiesto non è disponibile. Torna alla home o vai alla sezione catalogo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="tap-target btn-primary px-6 py-4 font-bold text-center">
              Torna alla home
            </Link>
            <Link href="/#prodotti" className="tap-target btn-secondary px-6 py-4 font-bold border border-white/12 text-center">
              Vai al catalogo
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

