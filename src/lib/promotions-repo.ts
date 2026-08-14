import { getMongoDb } from '@/lib/mongo'

export type PromotionImageRecord = {
  id: string
  public_id: string
  secure_url: string
  mime_type: string
  format: string | null
  width: number | null
  height: number | null
  bytes: number | null
  sort_order: number
  created_at: string
}

export type PromotionRecord = {
  id: string
  title: string
  description: string | null
  price_eur: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  images: PromotionImageRecord[]
}

function colName() {
  return 'promotions'
}

export async function createPromotionDoc(promotion: PromotionRecord) {
  const db = await getMongoDb()
  const col = db.collection<PromotionRecord & { _id: string }>(colName())
  await col.updateOne(
    { _id: promotion.id },
    { $setOnInsert: { ...promotion, _id: promotion.id } },
    { upsert: true }
  )
  return promotion
}

export async function findPromotionById(id: string) {
  const db = await getMongoDb()
  const col = db.collection<PromotionRecord & { _id: string }>(colName())
  const doc = await col.findOne({ _id: id })
  if (!doc) return null
  const { _id: _ignored, ...rest } = doc as any
  return rest as PromotionRecord
}

export async function deletePromotionById(id: string) {
  const db = await getMongoDb()
  const col = db.collection<PromotionRecord & { _id: string }>(colName())
  const doc = await col.findOne({ _id: id })
  if (!doc) return null
  await col.deleteOne({ _id: id })
  const { _id: _ignored, ...rest } = doc as any
  return rest as PromotionRecord
}

export async function findPromotionImageById(imageId: string) {
  const db = await getMongoDb()
  const col = db.collection<PromotionRecord & { _id: string }>(colName())
  const doc = await col.findOne({ 'images.id': imageId })
  if (!doc) return null
  const image = Array.isArray(doc.images) ? doc.images.find((img) => img.id === imageId) : null
  if (!image) return null
  return { promotionId: doc._id, image }
}

export async function removePromotionImageById(imageId: string) {
  const db = await getMongoDb()
  const col = db.collection<PromotionRecord & { _id: string }>(colName())
  const target = await findPromotionImageById(imageId)
  if (!target) return null
  await col.updateOne({ _id: target.promotionId }, { $pull: { images: { id: imageId } } })
  return target
}
