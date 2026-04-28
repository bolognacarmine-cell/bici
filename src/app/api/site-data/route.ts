import { NextResponse } from 'next/server'
import { readSiteData } from '@/lib/site-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await readSiteData()
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

