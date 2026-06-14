import Link from 'next/link'

const COMPANY_NAME = 'Cicli Moto Amati Bonaccorsi'
const COMPANY_EMAIL = 'ciclomoto2026@libero.it'

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4da6ff] mb-8">Cookie Policy</h1>

        <div className="bg-[#2a2a2a] p-6 rounded-lg text-gray-300 space-y-4">
          <p>
            Questo sito di {COMPANY_NAME} utilizza solo cookie tecnici necessari al funzionamento, alla sicurezza e alla
            gestione della sessione.
          </p>

          <p>
            <strong className="text-white">Cookie tecnici:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Cookie di sessione per funzionalita essenziali e navigazione.</li>
            <li>Memorizzazione locale della scelta sul banner cookie.</li>
            <li>Eventuali cookie tecnici per l&apos;accesso all&apos;area admin.</li>
          </ul>

          <p>
            <strong className="text-white">Cookie di terze parti:</strong> nessun cookie di profilazione o marketing
            viene attivato senza consenso.
          </p>

          <p>
            <strong className="text-white">Gestione del consenso:</strong> puoi accettare o rifiutare dal banner. La
            scelta viene salvata sul dispositivo per evitare la ripetizione dell&apos;avviso a ogni visita.
          </p>

          <p>
            Per maggiori informazioni sul trattamento dei dati personali consulta anche la{' '}
            <Link href="/privacy" className="text-[#4da6ff] underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>

          <p>
            <strong className="text-white">Contatti:</strong>{' '}
            <a className="text-[#4da6ff] underline underline-offset-4" href={`mailto:${COMPANY_EMAIL}`}>
              {COMPANY_EMAIL}
            </a>
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

