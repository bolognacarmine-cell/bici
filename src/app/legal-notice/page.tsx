import Link from 'next/link'

const COMPANY_NAME = 'Cicli Moto Amati Bonaccorsi'
const COMPANY_CF = '02402630616'
const COMPANY_REA = 'CE170393'
const COMPANY_EMAIL = 'ciclomoto2026@libero.it'
const COMPANY_ADDRESS = 'Via Novelli, 51, Marcianise (CE) 81025, Italia'

export default function LegalNoticePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(900px_540px_at_10%_30%,rgba(0,245,255,0.10),transparent_60%),radial-gradient(900px_540px_at_90%_40%,rgba(163,255,0,0.08),transparent_60%)]">
      <div className="container mx-auto px-6 py-16">
        <div className="glass border border-white/12 rounded-[32px] p-8 md:p-10 max-w-3xl">
          <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Legal</div>
          <h1 className="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-white">Note Legali</h1>

          <div className="mt-6 text-white/70 leading-relaxed space-y-4">
            <p>
              <span className="text-white font-semibold">Intestatario:</span> {COMPANY_NAME}
              <br />
              <span className="text-white font-semibold">Codice Fiscale:</span> {COMPANY_CF}
              <br />
              <span className="text-white font-semibold">REA:</span> {COMPANY_REA}
              <br />
              <span className="text-white font-semibold">Sede:</span> {COMPANY_ADDRESS}
              <br />
              <span className="text-white font-semibold">Email:</span>{' '}
              <a className="underline underline-offset-4" href={`mailto:${COMPANY_EMAIL}`}>
                {COMPANY_EMAIL}
              </a>
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Contenuti e responsabilità</h2>
            <p>
              I contenuti del sito hanno scopo informativo. Disponibilità, prezzi e servizi possono variare e vengono
              confermati via contatto diretto.
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Collegamenti esterni</h2>
            <p>
              Il sito può contenere collegamenti a siti o servizi di terze parti (es. WhatsApp). {COMPANY_NAME} non è
              responsabile dei contenuti o delle policy di tali servizi.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link href="/privacy" className="tap-target btn-secondary px-6 py-4 font-bold border border-white/12 inline-flex justify-center">
                Privacy
              </Link>
              <Link
                href="/cookie-policy"
                className="tap-target btn-secondary px-6 py-4 font-bold border border-white/12 inline-flex justify-center"
              >
                Cookie Policy
              </Link>
              <Link
                href="/termini-e-condizioni"
                className="tap-target btn-secondary px-6 py-4 font-bold border border-white/12 inline-flex justify-center"
              >
                Termini e Condizioni
              </Link>
              <Link href="/" className="tap-target btn-primary px-6 py-4 font-bold inline-flex justify-center">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

