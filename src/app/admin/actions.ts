'use server'

import { revalidatePath } from 'next/cache'
import { writeSiteData } from '@/lib/site-data'

export async function updateData(newData: unknown) {
  await writeSiteData(newData)
  revalidatePath('/')
  revalidatePath('/admin')
}
