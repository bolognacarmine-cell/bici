import { z } from 'zod'

const PromotionSchema = z.object({
  title: z.string(),
  description: z.string(),
  image: z.string(),
})

const ProductSchema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
  image: z.string(),
})

export const SiteDataSchema = z
  .object({
    promotions: z.array(PromotionSchema).optional(),
    products: z.array(ProductSchema).optional(),
  })
  .passthrough()

export type Promotion = z.infer<typeof PromotionSchema>
export type Product = z.infer<typeof ProductSchema>
export type SiteData = z.infer<typeof SiteDataSchema>

