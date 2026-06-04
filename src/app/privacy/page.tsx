import Link from 'next/link'

const COMPANY_NAME = 'Cicli Moto Amati Bonaccorsi'
const COMPANY_CF = '02402630616'
const COMPANY_REA = 'CE170393'
const COMPANY_EMAIL = 'ciclomoto2026@libero.it'
const COMPANY_ADDRESS = 'Via Novelli, 51, Marcianise (CE) 81025, Italia'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(900px_540px_at_10%_30%,rgba(0,245,255,0.10),transparent_60%),radial-gradient(900px_540px_at_90%_40%,rgba(163,255,0,0.08),transparent_60%)]">
      <div className="container mx-auto px-6 py-16">
        <div className="glass border border-white/12 rounded-[32px] p-8 md:p-10 max-w-3xl">
          <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Privacy</div>
          <h1 className="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-white">Informativa Privacy</h1>

          <div className="mt-6 text-white/70 leading-relaxed space-y-4">
            <p>
              Questa informativa descrive come vengono trattati i dati personali quando navighi su questo sito e quando ci
              contatti per informazioni, disponibilità o assistenza.
            </p>

            <p>
              <span className="text-white font-semibold">Titolare del trattamento:</span> {COMPANY_NAME} — CF {COMPANY_CF} — REA {COMPANY_REA}
              <br />
              <span className="text-white font-semibold">Sede:</span> {COMPANY_ADDRESS}
              <br />
              <span className="text-white font-semibold">Email:</span>{' '}
              <a className="underline underline-offset-4" href={`mailto:${COMPANY_EMAIL}`}>
                {COMPANY_EMAIL}
              </a>
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Dati che trattiamo</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-white font-semibold">Dati di contatto</span> che ci fornisci (es. numero, nome, messaggio) quando ci chiami o ci scrivi.
              </li>
              <li>
                <span className="text-white font-semibold">Dati tecnici</span> di navigazione (es. indirizzo IP, user-agent, log di sistema) necessari a sicurezza e funzionamento.
              </li>
              <li>
                <span className="text-white font-semibold">Cookie tecnici</span> strettamente necessari (vedi{' '}
                <Link href="/cookie-policy" className="underline underline-offset-4">
                  Cookie Policy
                </Link>
                ).
              </li>
            </ul>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Finalità e base giuridica</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Rispondere a richieste e fornire assistenza (esecuzione di misure precontrattuali/contrattuali).</li>
              <li>Sicurezza del sito e prevenzione abusi (legittimo interesse).</li>
              <li>Obblighi di legge e fiscali, se applicabili (obbligo legale).</li>
            </ul>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Conservazione</h2>
            <p>I dati vengono conservati per il tempo necessario a gestire la richiesta e per eventuali obblighi di legge.</p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Destinatari e trasferimenti</h2>
            <p>
              Il sito è ospitato su infrastruttura di hosting. Contenuti multimediali possono essere serviti tramite fornitori tecnici (es. CDN).
              Non utilizziamo cookie di profilazione senza consenso.
            </p>

            <h2 className="text-white font-extrabold tracking-tight text-xl pt-2">Diritti</h2>
            <p>
              Puoi richiedere accesso, rettifica, cancellazione, limitazione, opposizione e portabilità nei limiti previsti dal GDPR, scrivendo a{' '}
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

