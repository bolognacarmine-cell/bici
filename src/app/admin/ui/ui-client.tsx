'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { FileUp, Trash2, Save, ArrowLeft, Pencil } from 'lucide-react'

type RecordRow = {
  id: string
  title: string
  category: string
  status: 'attiva' | 'bozza' | 'archiviata'
  updatedAt: string
}

function PhoneFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full max-w-[390px]">
      <div className="text-xs font-semibold text-zinc-400 mb-3">{title}</div>
      <div className="relative rounded-[52px] bg-black border border-white/10 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="relative rounded-[44px] overflow-hidden bg-zinc-950 border border-white/10">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-40 rounded-full bg-black/70 border border-white/10 z-20" />
          {children}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: RecordRow['status'] }) {
  const cfg = useMemo(() => {
    if (status === 'attiva') return { label: 'Attiva', cls: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25' }
    if (status === 'archiviata') return { label: 'Archiviata', cls: 'bg-zinc-500/15 text-zinc-200 border-white/10' }
    return { label: 'Bozza', cls: 'bg-sky-500/15 text-sky-200 border-sky-500/25' }
  }, [status])

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.cls}`}>{cfg.label}</span>
}

function FileUploadField({
  label,
  mockFileName,
}: {
  label: string
  mockFileName?: string
}) {
  const [fileName, setFileName] = useState<string | null>(mockFileName ?? null)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
      <div className="text-xs font-bold tracking-widest uppercase text-zinc-400">{label}</div>
      <div className="mt-3 flex flex-col gap-2">
        <label className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-zinc-100 hover:bg-white/8 cursor-pointer">
          <FileUp className="h-4 w-4" />
          Seleziona file
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              ;(e.target as any).value = ''
              if (!f) return
              setFileName(f.name)
            }}
          />
        </label>

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-zinc-300">
            {fileName ? <span className="block truncate">{fileName}</span> : <span className="text-zinc-500">Nessun file selezionato</span>}
          </div>
          <button
            type="button"
            disabled={!fileName}
            onClick={() => setFileName(null)}
            className="shrink-0 inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-extrabold text-red-200 disabled:opacity-40"
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  )
}

function RecordsTable({ rows }: { rows: RecordRow[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-zinc-100">Gestione record</div>
            <div className="text-xs text-zinc-400">{rows.length} elementi</div>
          </div>
          <button
            type="button"
            className="shrink-0 inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-extrabold text-red-200 hover:bg-red-500/15"
          >
            Elimina tutte
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px]">
          <thead className="bg-black/25">
            <tr className="text-left text-[11px] font-bold tracking-widest uppercase text-zinc-400">
              <th className="px-4 py-3">Titolo</th>
              <th className="px-4 py-3">Stato</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-zinc-100 truncate">{r.title}</div>
                    <div className="text-xs text-zinc-500">Aggiornato: {r.updatedAt}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-semibold text-zinc-300 truncate max-w-[16ch]">{r.category}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-zinc-100 hover:bg-white/8"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-extrabold text-red-200 hover:bg-red-500/15"
                      aria-label="Elimina record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminMobileScreen({ withFileSelected }: { withFileSelected: boolean }) {
  const rows: RecordRow[] = useMemo(
    () => [
      { id: '1', title: 'Bici trekking E‑Motion 500', category: 'Trekking', status: 'attiva', updatedAt: 'Oggi' },
      { id: '2', title: 'Promo check‑up officina', category: 'Servizi', status: 'bozza', updatedAt: 'Ieri' },
      { id: '3', title: 'Set luci LED urban', category: 'Accessori', status: 'archiviata', updatedAt: '12 apr' },
    ],
    []
  )

  return (
    <div className="h-[844px] w-full">
      <div className="h-full w-full overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur border-b border-white/10">
          <div className="px-4 pt-14 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 grid place-items-center text-emerald-300 font-extrabold">
                  RR
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-zinc-100 truncate">Admin</div>
                  <div className="text-xs text-zinc-400 truncate">Road Runner</div>
                </div>
              </div>
              <Link
                href="/"
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-zinc-100 hover:bg-white/8"
              >
                <ArrowLeft className="h-4 w-4" />
                Sito
              </Link>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 space-y-4 pb-28">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/6 to-white/2 p-4">
            <div className="text-sm font-extrabold text-zinc-100">Pannello gestione</div>
            <div className="mt-1 text-xs text-zinc-400">UI mobile ottimizzata, zero overflow</div>
          </div>

          <RecordsTable rows={rows} />

          <FileUploadField
            label="Upload immagini prodotto"
            mockFileName={
              withFileSelected ? 'immagine-prodotto-bici-trekking-e-motion-500-hero-1920x1080.jpg' : undefined
            }
          />
        </div>

        <div className="sticky bottom-0 z-30">
          <div className="pointer-events-none h-10 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="pointer-events-auto border-t border-white/10 bg-zinc-950/90 backdrop-blur px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400"
              >
                <Save className="h-5 w-5" />
                Salva modifiche
              </button>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">Il pulsante resta sempre visibile, anche durante lo scroll.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminUiClient() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3">
          <div className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin UI (mobile iPhone 14/15 Pro)</div>
          <div className="text-sm text-zinc-400">Stato normale + stato con file caricato</div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start justify-items-center">
          <PhoneFrame title="Stato normale">
            <AdminMobileScreen withFileSelected={false} />
          </PhoneFrame>
          <PhoneFrame title="File caricato">
            <AdminMobileScreen withFileSelected />
          </PhoneFrame>
        </div>
      </div>
    </div>
  )
}
