import Link from 'next/link'
import { adminLogin } from './actions'
import { getAdminUser, isAdminConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams
  const error = sp?.error === '1'

  if (!isAdminConfigured()) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-5 py-10">
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-0 -z-10 bg-noise" />
          <div className="absolute inset-0 -z-10 grid-overlay opacity-50" />
          <div className="glass-dark rounded-3xl p-6 md:p-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight">Admin disabled</h1>
                <p className="mt-2 text-sm md:text-base text-[var(--muted)] leading-relaxed">
                  Imposta la variabile d’ambiente <span className="font-mono">ADMIN_PASSWORD</span> su Render e ridistribuisci.
                </p>
              </div>
              <Link
                href="/"
                className="shrink-0 tap-target inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold glass hover:border-white/20 transition-colors"
              >
                Torna al sito
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const user = getAdminUser()

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-5 py-10">
      <div className="relative max-w-lg mx-auto">
        <div className="absolute inset-0 -z-10 bg-noise" />
        <div className="absolute inset-0 -z-10 grid-overlay opacity-50" />
        <div className="glass-dark rounded-3xl p-6 md:p-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight">Login Admin</h1>
              <p className="mt-2 text-sm md:text-base text-[var(--muted)] leading-relaxed">
                Accedi per gestire promozioni e prodotti.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 tap-target inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold glass hover:border-white/20 transition-colors"
            >
              Torna al sito
            </Link>
          </div>

          {error && (
            <div className="mt-5 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 font-medium">
              Credenziali non valide.
            </div>
          )}

          <form action={adminLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-[var(--muted-2)] uppercase mb-2">User</label>
              <input
                name="user"
                defaultValue={user}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-[rgb(0,245,255)] focus:ring-2 focus:ring-[rgba(0,245,255,0.18)] transition"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-[var(--muted-2)] uppercase mb-2">Password</label>
              <input
                name="password"
                type="password"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:border-[rgb(0,245,255)] focus:ring-2 focus:ring-[rgba(0,245,255,0.18)] transition"
                autoComplete="current-password"
                required
              />
            </div>
            <button className="w-full tap-target rounded-xl px-5 py-3 font-semibold btn-primary">
              Entra
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

