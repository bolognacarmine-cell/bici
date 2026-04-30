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
    images: z.array(z.string().min(1)).optional(),
    extensions: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .optional(),
    priceEur: z.number().positive().optional(),
    offerActive: z.boolean().optional(),
    offerPriceEur: z.number().positive().optional(),
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
    if (val.offerActive) {
      if (typeof val.offerPriceEur !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['offerPriceEur'],
          message: 'Se l’offerta è attiva, il prezzo offerta è obbligatorio.',
        })
      }
      if (typeof val.priceEur === 'number' && typeof val.offerPriceEur === 'number' && val.offerPriceEur >= val.priceEur) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['offerPriceEur'],
          message: 'Il prezzo offerta deve essere inferiore al prezzo base.',
        })
      }
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

    price: z.string().optional(),
    priceEur: z.number().positive().optional(),
    salePrice: z.string().optional(),
    salePriceEur: z.number().positive().optional(),

    description: z.string().optional(),
    fullDescription: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    weightKg: z.number().positive().optional(),
    stockQty: z.number().int().nonnegative().optional(),

    image: z.string().optional(),
    images: z.array(z.string().min(1)).optional(),
    gallery: z.array(z.string()).optional(),
    extensions: z
      .array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .optional(),

    ebike: EbikeSchema.optional(),

    internalNote: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const priceFromString = Number.parseFloat(String(val.price ?? '').replace(',', '.'))
    const resolvedPrice =
      typeof val.priceEur === 'number' ? val.priceEur : Number.isFinite(priceFromString) ? priceFromString : Number.NaN
    if (!Number.isFinite(resolvedPrice) || resolvedPrice <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceEur'],
        message: 'Il prezzo deve essere maggiore di zero.',
      })
    }
    const saleFromString = Number.parseFloat(String(val.salePrice ?? '').replace(',', '.'))
    const resolvedSale =
      typeof val.salePriceEur === 'number'
        ? val.salePriceEur
        : Number.isFinite(saleFromString)
          ? saleFromString
          : Number.NaN
    if (val.salePrice || typeof val.salePriceEur === 'number') {
      if (!Number.isFinite(resolvedSale) || resolvedSale <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salePriceEur'],
          message: 'Il prezzo scontato deve essere maggiore di zero.',
        })
      } else if (Number.isFinite(resolvedPrice) && resolvedSale > resolvedPrice) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['salePriceEur'],
          message: 'Il prezzo scontato non può superare il prezzo base.',
        })
      }
    }
    const hasPrimaryImage =
      (typeof val.image === 'string' && val.image.trim().length > 0) || (Array.isArray(val.images) && val.images.length > 0)
    if (!hasPrimaryImage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['images'],
        message: "L'immagine principale è obbligatoria.",
      })
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

