import Link from 'next/link'

const COMPANY_NAME = 'Cicli Moto Amati Bonaccorsi'
const COMPANY_CF = '02402630616'
const COMPANY_REA = 'CE170393'
const COMPANY_EMAIL = 'ciclomoto2026@libero.it'
const COMPANY_ADDRESS = 'Via Novelli, 51, Marcianise (CE) 81025'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4da6ff] mb-8">Privacy Policy</h1>

        <div className="bg-[#2a2a2a] p-6 rounded-lg text-gray-300 space-y-4">
          <p>
            Questa informativa descrive come vengono trattati i dati personali quando navighi su questo sito e quando ci
            contatti per informazioni, disponibilita o assistenza.
          </p>

          <p>
            <strong className="text-white">Titolare:</strong> {COMPANY_NAME}
          </p>
          <p>
            <strong className="text-white">Codice Fiscale:</strong> {COMPANY_CF}
          </p>
          <p>
            <strong className="text-white">REA:</strong> {COMPANY_REA}
          </p>
          <p>
            <strong className="text-white">Indirizzo:</strong> {COMPANY_ADDRESS}
          </p>
          <p>
            <strong className="text-white">Email:</strong>{' '}
            <a className="text-[#4da6ff] underline underline-offset-4" href={`mailto:${COMPANY_EMAIL}`}>
              {COMPANY_EMAIL}
            </a>
          </p>

          <p>
            <strong className="text-white">Dati trattati:</strong> dati di contatto forniti volontariamente, dati tecnici
            di navigazione e cookie tecnici necessari al funzionamento del sito.
          </p>

          <p>
            <strong className="text-white">Finalita:</strong> gestione delle richieste di contatto, assistenza clienti,
            sicurezza del sito, adempimenti amministrativi e obblighi di legge.
          </p>

          <p>
            <strong className="text-white">Base giuridica:</strong> esecuzione di misure precontrattuali o contrattuali,
            legittimo interesse e obblighi di legge.
          </p>

          <p>
            <strong className="text-white">Conservazione:</strong> i dati vengono conservati per il tempo strettamente
            necessario alla gestione delle richieste e agli obblighi normativi applicabili.
          </p>

          <p>
            <strong className="text-white">Diritti dell&apos;interessato:</strong> puoi richiedere accesso, rettifica,
            cancellazione, limitazione o opposizione scrivendo all&apos;indirizzo email sopra indicato.
          </p>

          <p>
            Per maggiori dettagli sui cookie tecnici utilizzati dal sito consulta anche la{' '}
            <Link href="/cookie-policy" className="text-[#4da6ff] underline underline-offset-4">
              Cookie Policy
            </Link>
            .
          </p>

          <div className="pt-4">
            <Link href="/" className="tap-target inline-flex rounded-lg border border-[#4da6ff]/30 px-5 py-3 font-bold text-[#4da6ff]">
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

