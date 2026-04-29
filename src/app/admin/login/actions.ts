'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminSession, isAdminConfigured, verifyAdminCredentials } from '@/lib/admin-auth'

export async function adminLogin(formData: FormData) {
  if (!isAdminConfigured()) {
    redirect('/admin')
  }

  const user = String(formData.get('user') || '')
  const password = String(formData.get('password') || '')
  if (!verifyAdminCredentials(user, password)) {
    redirect('/admin/login?error=1')
  }

  const session = createAdminSession()
  if (!session) {
    redirect('/admin/login?error=1')
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_session', session, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/admin')
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.set('admin_session', '', { path: '/', maxAge: 0 })
  redirect('/')
}

