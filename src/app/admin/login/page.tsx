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
      <div className="min-h-screen bg-zinc-100 text-zinc-900 px-5 py-10 font-sans">
        <div className="max-w-lg mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Admin disabled</h1>
              <p className="mt-2 text-zinc-600 leading-relaxed">
                Imposta la variabile d’ambiente <span className="font-mono">ADMIN_PASSWORD</span> su Render e ridistribuisci.
              </p>
            </div>
            <Link href="/" className="shrink-0 px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
              Torna al sito
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const user = getAdminUser()

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 px-5 py-10 font-sans">
      <div className="max-w-lg mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl border border-zinc-200 bg-white grid place-items-center overflow-hidden">
              <Image
                src={toHostedAssetUrl('/logo-vincenzobike.png?v=3')}
                alt="VincenzoBike"
                width={44}
                height={44}
                className="h-10 w-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Login Admin</h1>
            <p className="mt-1 text-zinc-600">Accedi per gestire promozioni e prodotti.</p>
          </div>
          <Link href="/" className="shrink-0 px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
            Torna al sito
          </Link>
        </div>

        {error && <div className="mt-4 p-3 rounded-lg bg-red-100 text-red-700 font-medium">Credenziali non valide.</div>}

        <form action={adminLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">User</label>
            <input
              name="user"
              defaultValue={user}
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none bg-white text-zinc-900 placeholder-zinc-400"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none bg-white text-zinc-900 placeholder-zinc-400"
              autoComplete="current-password"
              required
            />
          </div>
          <button className="w-full px-5 py-2 bg-[#e67e22] text-white font-bold rounded-lg hover:bg-[#d35400] transition-colors">
            Entra
          </button>
        </form>
      </div>
    </div>
  )
}

