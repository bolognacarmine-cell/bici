import { z } from 'zod'

const ProductGenderSchema = z.enum(['uomo', 'donna', 'unisex'])

const ProductCategorySchema = z.enum([
  'city',
  'mtb',
  'trekking',
  'gravel',
  'road',
  'junior',
  'ebike_city',
  'ebike_trekking',
  'ebike_emtb',
  'ebike_cargo',
  'accessory',
  'spare_part',
])

const ProductStatusSchema = z.enum(['available', 'out_of_stock', 'preorder', 'discontinued'])

const EbikeSchema = z.object({
  batteryWh: z.number().positive().optional(),
  rangeKm: z.number().positive().optional(),
  motorW: z.number().positive().optional(),
  torqueNm: z.number().positive().optional(),
  chargeTimeH: z.number().positive().optional(),
  display: z.string().optional(),
  assistLevels: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

const PromotionScopeSchema = z.enum(['general', 'category', 'product'])
const PromotionDiscountTypeSchema = z.enum(['percent', 'amount'])
const PromotionStatusSchema = z.enum(['draft', 'active', 'scheduled', 'expired'])

const PromotionSchema = z
  .object({
    title: z.string().min(1),
    scope: PromotionScopeSchema.default('general'),
    status: PromotionStatusSchema.default('draft'),
    discountType: PromotionDiscountTypeSchema.default('percent'),
    discountValue: z.number().positive().default(10),

    category: ProductCategorySchema.optional(),
    productSku: z.string().min(1).optional(),

    description: z.string().optional(),
    code: z.string().optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    minOrderValue: z.number().positive().optional(),
    minQty: z.number().int().positive().optional(),
    showOnHome: z.boolean().optional(),
    ctaText: z.string().optional(),
    ctaHref: z.string().optional(),
    internalNote: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.discountType === 'percent') {
      if (val.discountValue < 1 || val.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Per le promo percentuali il valore deve essere tra 1 e 100.',
        })
      }
    }
    if (val.scope === 'product' && !val.productSku) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['productSku'],
        message: 'Se la promo è su prodotto, il prodotto è obbligatorio.',
      })
    }
    if (val.scope === 'category' && !val.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Se la promo è su categoria, la categoria è obbligatoria.',
      })
    }
  })

const ProductSchema = z
  .object({
    name: z.string().min(1),
    category: ProductCategorySchema.default('city'),
    gender: ProductGenderSchema.optional(),
    status: ProductStatusSchema.default('available'),

    sizeMode: z.enum(['alpha', 'cm', 'inch']).optional(),
    sizes: z.array(z.string()).optional(),

    sku: z.string().min(1).optional(),
    slug: z.string().optional(),

    price: z.string().min(1),
    salePrice: z.string().optional(),

    description: z.string().optional(),
    fullDescription: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    weightKg: z.number().positive().optional(),
    stockQty: z.number().int().nonnegative().optional(),

    image: z.string().min(1),
    gallery: z.array(z.string()).optional(),

    ebike: EbikeSchema.optional(),

    internalNote: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const price = Number.parseFloat(val.price)
    if (!Number.isFinite(price) || price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Il prezzo deve essere maggiore di zero.',
      })
    }
    if (val.salePrice) {
      const sale = Number.parseFloat(val.salePrice)
      if (!Number.isFinite(sale) || sale <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salePrice'],
          message: 'Il prezzo scontato deve essere maggiore di zero.',
        })
      } else if (Number.isFinite(price) && sale > price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salePrice'],
          message: 'Il prezzo scontato non può superare il prezzo base.',
        })
      }
    }
    const isEbike = val.category.startsWith('ebike_')
    if (isEbike) {
      if (!val.ebike) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ebike'],
          message: 'I dati e-bike sono richiesti per categorie elettriche.',
        })
      } else {
        const required: Array<keyof z.infer<typeof EbikeSchema>> = ['batteryWh', 'rangeKm', 'motorW']
        for (const key of required) {
          if (typeof val.ebike[key] !== 'number') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['ebike', key],
              message: 'Campo richiesto per e-bike.',
            })
          }
        }
      }
    }

    if (val.category === 'junior' && Array.isArray(val.sizes) && val.sizes.length > 0) {
      const allowed = new Set(['12"', '14"', '16"', '20"', '24"', '26"'])
      for (const s of val.sizes) {
        if (!allowed.has(s)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sizes'],
            message: 'Per Junior usa taglie ruota in pollici (12", 14", 16", 20", 24", 26").',
          })
          break
        }
      }
    }

    if (val.category === 'junior' && val.sizeMode && val.sizeMode !== 'inch') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sizeMode'],
        message: 'Per Junior la taglia deve essere in pollici.',
      })
    }
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

