import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isAdminConfigured, verifyAdminSession } from '@/lib/admin-auth'
import AdminUiClient from './ui-client'

export const dynamic = 'force-dynamic'

export default async function AdminUiPage() {
  if (!isAdminConfigured()) {
    redirect('/admin')
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!verifyAdminSession(session)) {
    redirect('/admin/login')
  }

  return <AdminUiClient />
}

