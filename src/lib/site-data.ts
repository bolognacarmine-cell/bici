import fs from 'fs/promises'
import path from 'path'
import { SiteDataSchema, type SiteData } from './site-data-schema'

export function getSiteDataFilePath() {
  return path.join(process.cwd(), 'src', 'data.json')
}

export async function readSiteData(): Promise<SiteData> {
  const filePath = getSiteDataFilePath()
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return SiteDataSchema.parse(parsed)
}

export async function writeSiteData(newData: unknown): Promise<void> {
  const filePath = getSiteDataFilePath()
  const validated = SiteDataSchema.parse(newData)
  await fs.writeFile(filePath, JSON.stringify(validated, null, 2))
}

