import { NextResponse } from 'next/server'
import { readSiteData } from '@/lib/site-data'

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
    const message = err instanceof Error ? err.message : 'Unknown error'
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

