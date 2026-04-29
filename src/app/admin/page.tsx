import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClientPage from './admin-client'
import { isAdminConfigured, verifyAdminSession } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!isAdminConfigured()) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-5 py-10">
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-0 -z-10 bg-noise" />
          <div className="absolute inset-0 -z-10 grid-overlay opacity-50" />
          <div className="glass-dark rounded-3xl p-6 md:p-7">
            <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight">Admin disabled</h1>
            <p className="mt-2 text-sm md:text-base text-[var(--muted)] leading-relaxed">
              Imposta la variabile d’ambiente <span className="font-mono">ADMIN_PASSWORD</span> su Render e ridistribuisci.
            </p>
          </div>
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
