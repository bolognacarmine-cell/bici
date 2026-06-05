import { NextResponse } from 'next/server'
import { readSiteData } from '@/lib/site-data'
import { writeSiteData } from '@/lib/site-data'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await readSiteData()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Unknown error'
    const message =
      raw.includes('SSL routines') || raw.includes('tlsv1 alert')
        ? 'Errore TLS verso MongoDB (verifica MONGODB_URI, Network Access su Atlas e che il cluster sia attivo).'
        : raw
    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')?.value
    if (!verifyAdminSession(session)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    await writeSiteData(body)
    revalidatePath('/')
    revalidatePath('/admin')

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi.', issues: err.issues },
        {
          status: 400,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }
    const raw = err instanceof Error ? err.message : 'Unknown error'
    const message =
      raw.includes('SSL routines') || raw.includes('tlsv1 alert')
        ? 'Errore TLS verso MongoDB (verifica MONGODB_URI, Network Access su Atlas e che il cluster sia attivo).'
        : raw
    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

