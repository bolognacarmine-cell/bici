import Link from 'next/link'
import { adminLogin } from './actions'
import { getAdminUser, isAdminConfigured } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams
  const error = sp?.error === '1'

  if (!isAdminConfigured()) {
    return (
      <div className="min-h-screen bg-zinc-100 p-8 font-sans">
        <div className="max-w-lg mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Admin disabled</h1>
          <p className="mt-2 text-zinc-600">
            Imposta la variabile d’ambiente <span className="font-mono">ADMIN_PASSWORD</span> su Render e ridistribuisci.
          </p>
          <Link href="/" className="inline-block mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800">
            Torna al sito
          </Link>
        </div>
      </div>
    )
  }

  const user = getAdminUser()

  return (
    <div className="min-h-screen bg-zinc-100 p-8 font-sans">
      <div className="max-w-lg mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Login Admin</h1>
            <p className="mt-1 text-zinc-600">Accedi per gestire promozioni e prodotti.</p>
          </div>
          <Link href="/" className="text-sm font-bold text-zinc-700 hover:text-zinc-900">
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
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none"
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

