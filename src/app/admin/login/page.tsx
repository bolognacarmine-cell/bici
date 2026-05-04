import Link from 'next/link'
import { adminLogin } from './actions'
import { getAdminUser, isAdminConfigured } from '@/lib/admin-auth'
import Image from 'next/image'
import { toHostedAssetUrl } from '@/lib/asset-url'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams
  const error = sp?.error === '1'

  if (!isAdminConfigured()) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 px-4 py-10 font-sans overflow-x-hidden">
        <div className="max-w-lg mx-auto rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-100">Admin disabled</h1>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Imposta la variabile d’ambiente <span className="font-mono text-zinc-100">ADMIN_PASSWORD</span> su Render e ridistribuisci.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-zinc-100 hover:bg-white/8"
            >
              Torna al sito
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const user = getAdminUser()

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 px-4 py-10 font-sans overflow-x-hidden">
      <div className="max-w-lg mx-auto rounded-3xl border border-white/10 bg-black/30 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden shrink-0">
              <Image
                src={toHostedAssetUrl('/logo-vincenzobike.png?v=3')}
                alt="VincenzoBike"
                width={44}
                height={44}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-100">Login Admin</h1>
              <p className="mt-1 text-sm text-zinc-400">Accedi per gestire promozioni e prodotti.</p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-zinc-100 hover:bg-white/8"
          >
            Torna al sito
          </Link>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
            Credenziali non valide.
          </div>
        )}

        <form action={adminLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">User</label>
            <input
              name="user"
              defaultValue={user}
              className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40"
              autoComplete="current-password"
              required
            />
          </div>
          <button className="w-full px-5 py-3 bg-emerald-500 text-zinc-950 font-extrabold rounded-2xl hover:bg-emerald-400 transition-colors">
            Entra
          </button>
        </form>
      </div>
    </div>
  )
}

