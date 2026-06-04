import Link from 'next/link'

const COMPANY_NAME = 'Cicli Moto Amati Bonaccorsi'
const COMPANY_EMAIL = 'ciclomoto2026@libero.it'

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(900px_540px_at_10%_30%,rgba(0,245,255,0.10),transparent_60%),radial-gradient(900px_540px_at_90%_40%,rgba(163,255,0,0.08),transparent_60%)]">
      <div className="container mx-auto px-6 py-16">
        <div className="glass border border-white/12 rounded-[32px] p-8 md:p-10 max-w-3xl">
          <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Cookie</div>
          <h1 className="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-white">Cookie Policy</h1>

          <div className="mt-6 text-white/70 leading-relaxed space-y-4">
            <p>
              Questa pagina spiega l’uso dei cookie su questo sito di {COMPANY_NAME}. Per maggiori informazioni sul
              trattamento dei dati personali leggi anche{' '}
              <Link href="/privacy" className="underline underline-offset-4">
                l’Informativa Privacy
              </Link>
              .
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Cookie tecnici necessari</h2>
            <p>
              Usiamo cookie tecnici strettamente necessari al funzionamento e alla sicurezza. Un esempio è il cookie di
              sessione dell’area admin (se effettui l’accesso).
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Cookie di profilazione e marketing</h2>
            <p>
              Non utilizziamo cookie di profilazione o marketing senza consenso. Se in futuro saranno introdotti strumenti
              che richiedono consenso, verranno attivati solo dopo la tua scelta nel banner.
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Gestione del consenso</h2>
            <p>
              Puoi accettare o rifiutare dal banner. La scelta viene memorizzata sul dispositivo per non riproporre il
              banner ad ogni visita.
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Contatti</h2>
            <p>
              Per richieste relative ai cookie scrivi a{' '}
              <a className="underline underline-offset-4" href={`mailto:${COMPANY_EMAIL}`}>
                {COMPANY_EMAIL}
              </a>
              .
            </p>

            <div className="pt-4">
              <Link href="/" className="tap-target btn-secondary px-6 py-4 font-bold border border-white/12 inline-flex">
                Torna alla home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

