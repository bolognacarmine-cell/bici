import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' },
  })
}

function forbidden() {
  return new NextResponse('Admin disabled', { status: 403 })
}

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return forbidden()

  const expectedUser = process.env.ADMIN_USER || 'admin'
  const auth = req.headers.get('authorization') || ''
  if (!auth.toLowerCase().startsWith('basic ')) return unauthorized()

  let decoded = ''
  try {
    decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8')
  } catch {
    return unauthorized()
  }

  const idx = decoded.indexOf(':')
  if (idx < 0) return unauthorized()
  const user = decoded.slice(0, idx)
  const pass = decoded.slice(idx + 1)
  if (user !== expectedUser || pass !== password) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

