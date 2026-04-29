import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClientPage from './admin-client'
import { isAdminConfigured, verifyAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 px-5 py-10 font-sans">
        <div className="max-w-lg mx-auto bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Admin disabled</h1>
          <p className="mt-2 text-zinc-600 leading-relaxed">
            Imposta la variabile d’ambiente <span className="font-mono">ADMIN_PASSWORD</span> su Render e ridistribuisci.
          </p>
        </div>
      </div>
    )
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!verifyAdminSession(session)) {
    redirect('/admin/login')
  }

  return <AdminClientPage />
}
