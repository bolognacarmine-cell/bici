import Link from 'next/link'

const COMPANY_NAME = 'Cicli Moto Amati Bonaccorsi'
const COMPANY_CF = '02402630616'
const COMPANY_REA = 'CE170393'
const COMPANY_EMAIL = 'ciclomoto2026@libero.it'
const COMPANY_ADDRESS = 'Via Novelli, 51, Marcianise (CE) 81025, Italia'

export default function TerminiECondizioniPage() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4da6ff] mb-8">Termini e Condizioni di Uso</h1>

        <div className="bg-[#2a2a2a] p-6 rounded-lg text-gray-300 space-y-4">
          <p>
            <strong className="text-white">Ultimo aggiornamento:</strong> 14 giugno 2026
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">1. Informazioni del titolare</h2>
          <p>
            <strong className="text-white">Ragione sociale:</strong> {COMPANY_NAME}
          </p>
          <p>
            <strong className="text-white">Codice Fiscale:</strong> {COMPANY_CF}
          </p>
          <p>
            <strong className="text-white">REA:</strong> {COMPANY_REA}
          </p>
          <p>
            <strong className="text-white">Sede legale:</strong> {COMPANY_ADDRESS}
          </p>
          <p>
            <strong className="text-white">Email:</strong>{' '}
            <a className="text-[#4da6ff] underline underline-offset-4" href={`mailto:${COMPANY_EMAIL}`}>
              {COMPANY_EMAIL}
            </a>
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">2. Oggetto del sito</h2>
          <p>
            Il sito presenta informazioni commerciali e descrittive relative ai servizi di officina, riparazione,
            manutenzione, accessori e prodotti trattati da Ciclomoto.
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">3. Natura delle informazioni</h2>
          <p>
            Contenuti, immagini, disponibilita, prezzi e promozioni hanno finalita informativa e possono essere soggetti a
            variazioni, aggiornamenti o errori materiali. La conferma definitiva avviene tramite contatto diretto.
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">4. Utilizzo del sito</h2>
          <p>
            L&apos;utente si impegna a utilizzare il sito in modo lecito, corretto e non lesivo dei diritti del titolare o
            di terzi. Non e consentito tentare accessi non autorizzati, alterare contenuti o compromettere il
            funzionamento del servizio.
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">5. Proprieta intellettuale</h2>
          <p>
            Testi, immagini, marchi, grafiche e contenuti presenti sul sito appartengono ai rispettivi titolari e non
            possono essere copiati, distribuiti o riutilizzati senza autorizzazione, salvo ove consentito dalla legge.
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">6. Link esterni</h2>
          <p>
            Il sito puo contenere collegamenti a servizi esterni come WhatsApp, social network o mappe. Il titolare non e
            responsabile dei contenuti, delle disponibilita o delle policy dei siti terzi.
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">7. Limitazione di responsabilita</h2>
          <p>
            Pur adottando la massima cura nell&apos;aggiornamento dei contenuti, il titolare non garantisce l&apos;assenza di
            errori, interruzioni o inesattezze e non risponde di danni indiretti derivanti dall&apos;uso del sito.
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">8. Privacy e cookie</h2>
          <p>
            Il trattamento dei dati personali e l&apos;uso dei cookie sono disciplinati rispettivamente dalla{' '}
            <Link href="/privacy" className="text-[#4da6ff] underline underline-offset-4">
              Privacy Policy
            </Link>{' '}
            e dalla{' '}
            <Link href="/cookie-policy" className="text-[#4da6ff] underline underline-offset-4">
              Cookie Policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold text-[#4da6ff] mt-6">9. Legge applicabile</h2>
          <p>
            I presenti termini sono regolati dalla legge italiana. Per ogni controversia sara competente il foro previsto
            dalla normativa applicabile.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link href="/" className="tap-target inline-flex justify-center rounded-lg border border-[#4da6ff]/30 px-5 py-3 font-bold text-[#4da6ff]">
              Torna alla home
            </Link>
            <Link href="/legal-notice" className="tap-target inline-flex justify-center rounded-lg border border-white/15 px-5 py-3 font-bold text-white/85">
              Note legali
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
