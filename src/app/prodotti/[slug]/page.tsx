import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductCarousel } from './product-carousel'
import { readSiteData } from '@/lib/site-data'
import type { Product } from '@/lib/site-data-schema'
import { CONTACT_TEL_HREF, CONTACT_WHATSAPP_HREF } from '@/lib/contact'

export const dynamic = 'force-dynamic'

function availabilityLabel(status: string) {
  if (status === 'available') return 'Disponibile'
  if (status === 'preorder') return 'Pre-ordine'
  if (status === 'out_of_stock') return 'Esaurito'
  if (status === 'discontinued') return 'Fuori catalogo'
  return 'Disponibilità non specificata'
}

function genderLabel(value: string) {
  if (value === 'uomo') return 'Uomo'
  if (value === 'donna') return 'Donna'
  if (value === 'unisex') return 'Unisex'
  return value
}

function categoryLabel(value: string) {
  const v = String(value || '').trim()
  if (!v) return '—'
  if (v === 'city') return 'City'
  if (v === 'mtb') return 'MTB'
  if (v === 'trekking') return 'Trekking'
  if (v === 'gravel') return 'Gravel'
  if (v === 'road') return 'Corsa'
  if (v === 'junior') return 'Junior'
  if (v === 'ebike_city') return 'E-bike City'
  if (v === 'ebike_trekking') return 'E-bike Trekking'
  if (v === 'ebike_emtb') return 'E-MTB'
  if (v === 'ebike_cargo') return 'E-bike Cargo'
  if (v === 'accessory') return 'Accessori'
  if (v === 'spare_part') return 'Ricambi'
  return v
}

function availabilitySchema(status: string) {
  if (status === 'available') return 'https://schema.org/InStock'
  if (status === 'preorder') return 'https://schema.org/PreOrder'
  if (status === 'out_of_stock') return 'https://schema.org/OutOfStock'
  if (status === 'discontinued') return 'https://schema.org/Discontinued'
  return 'https://schema.org/InStock'
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://vincenzobike.example'
}

function toAbsoluteUrl(input: string) {
  const trimmed = String(input || '').trim()
  if (!trimmed) return null
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return new URL(trimmed.startsWith('/') ? trimmed : `/${trimmed}`, getSiteUrl()).toString()
}

function buildImages(product: Product) {
  const extra = (product as any).images
  const fromImages: string[] = []
  if (Array.isArray(extra)) {
    for (const entry of extra) {
      if (typeof entry === 'string') {
        const u = entry.trim()
        if (u) fromImages.push(u)
        continue
      }
      if (entry && typeof entry === 'object') {
        const u = String((entry as any).url ?? '').trim()
        if (u) fromImages.push(u)
      }
    }
  }
  const fromGallery = Array.isArray(product.gallery) ? product.gallery.map(String).filter(Boolean) : []
  const all = [String(product.image || '').trim(), ...fromImages, ...fromGallery].filter(Boolean)
  const seen = new Set<string>()
  const deduped: string[] = []
  for (const url of all) {
    if (seen.has(url)) continue
    seen.add(url)
    deduped.push(url)
  }
  return deduped.length > 0 ? deduped : ['/bici1.jpg']
}

async function getProductBySlugOrSku(slugOrSku: string) {
  const data = await readSiteData()
  const products = Array.isArray((data as any).products) ? ((data as any).products as Product[]) : []
  const target = String(slugOrSku || '').trim().toLowerCase()
  const product = products.find((p) => {
    const slug = String((p as any).slug || '').trim().toLowerCase()
    const sku = String((p as any).sku || '').trim().toLowerCase()
    return (slug && slug === target) || (sku && sku === target)
  })
  const brand = String(((data as any).brand?.name as any) || '').trim()
  return { product: product ?? null, siteBrand: brand || null }
}

function buildProductJsonLd(args: { product: Product; images: string[]; brandName: string | null }) {
  const { product, images, brandName } = args
  const name = String(product.name || '').trim()
  const description = String(product.fullDescription || product.description || '').trim()
  const sku = String((product as any).sku || '').trim()
  const brand = String((product as any).brand || brandName || '').trim()
  const url = new URL(`/prodotti/${String((product as any).slug || sku)}`, getSiteUrl()).toString()

  const variantsRaw = (product as any).variants
  const variants = Array.isArray(variantsRaw) ? variantsRaw.filter((v) => v && typeof v === 'object') : []

  const buildOffer = (input: any) => {
    const status = String(input?.status ?? (product as any).status ?? 'available')
    const numeric =
      typeof input?.salePriceEur === 'number'
        ? input.salePriceEur
        : typeof input?.priceEur === 'number'
          ? input.priceEur
          : typeof (product as any).salePriceEur === 'number'
            ? (product as any).salePriceEur
            : typeof (product as any).priceEur === 'number'
              ? (product as any).priceEur
              : null
    const price =
      typeof numeric === 'number'
        ? String(numeric)
        : String(input?.salePrice ?? input?.price ?? (product as any).salePrice ?? (product as any).price ?? '').trim()
    const skuValue = String(input?.sku ?? sku).trim()
    return {
      '@type': 'Offer',
      url,
      price,
      priceCurrency: 'EUR',
      availability: availabilitySchema(status),
      itemCondition: 'https://schema.org/NewCondition',
      sku: skuValue || undefined,
    }
  }

  let offers: any = buildOffer(product)
  if (variants.length > 0) {
    const offersList = variants.map(buildOffer).filter((o) => String(o.price || '').trim() !== '')
    const prices = offersList.map((o) => Number.parseFloat(String(o.price))).filter((n) => Number.isFinite(n))
    const low = prices.length ? Math.min(...prices) : NaN
    const high = prices.length ? Math.max(...prices) : NaN

    if (Number.isFinite(low) && Number.isFinite(high) && low !== high) {
      offers = {
        '@type': 'AggregateOffer',
        url,
        priceCurrency: 'EUR',
        lowPrice: String(low),
        highPrice: String(high),
        offerCount: offersList.length,
        offers: offersList,
      }
    } else {
      offers = offersList.length > 1 ? offersList : offersList[0] ?? buildOffer(product)
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: images.map((i) => toAbsoluteUrl(i)).filter(Boolean),
    description,
    sku: sku || undefined,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    offers,
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(String(rawSlug || ''))
  const { product, siteBrand } = await getProductBySlugOrSku(slug)
  if (!product) {
    return {
      title: 'Prodotto non trovato',
      description: 'Il prodotto richiesto non è disponibile.',
      robots: { index: false, follow: false },
    }
  }

  const brand = String((product as any).brand || siteBrand || '').trim()
  const title = String((product as any).seoTitle || '').trim() || (brand ? `${product.name} — ${brand}` : product.name)
  const description =
    String((product as any).seoDescription || '').trim() ||
    String(product.description || product.fullDescription || '').trim() ||
    `Dettagli, prezzo e disponibilità di ${product.name}.`

  const images = buildImages(product)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: images.map((src) => ({ url: src, alt: product.name })),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    alternates: {
      canonical: `/prodotti/${String((product as any).slug || (product as any).sku || rawSlug)}`,
    },
  }
}

export default async function ProdottoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = decodeURIComponent(String(rawSlug || ''))
  const { product, siteBrand } = await getProductBySlugOrSku(slug)
  if (!product) notFound()

  const images = buildImages(product)
  const brand = String((product as any).brand || siteBrand || '').trim()
  const sku = String((product as any).sku || '').trim()
  const status = String((product as any).status || 'available')
  const category = String((product as any).category || '').trim()
  const gender = String((product as any).gender || '').trim()
  const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
  const price =
    typeof (product as any).priceEur === 'number'
      ? euro.format(Number((product as any).priceEur))
      : String((product as any).price || '').trim()
  const salePrice =
    typeof (product as any).salePriceEur === 'number'
      ? euro.format(Number((product as any).salePriceEur))
      : String((product as any).salePrice || '').trim()
  const description = String(product.fullDescription || product.description || '').trim()
  const sizes = Array.isArray((product as any).sizes) ? ((product as any).sizes as string[]).map(String).filter(Boolean) : []
  const ebike =
    category.startsWith('ebike_') && (product as any).ebike && typeof (product as any).ebike === 'object' ? ((product as any).ebike as any) : null
  const ebikeBatteryWh = ebike && typeof ebike.batteryWh === 'number' ? ebike.batteryWh : null
  const ebikeRangeKm = ebike && typeof ebike.rangeKm === 'number' ? ebike.rangeKm : null
  const ebikeMotorW = ebike && typeof ebike.motorW === 'number' ? ebike.motorW : null
  const ebikeTorqueNm = ebike && typeof ebike.torqueNm === 'number' ? ebike.torqueNm : null
  const ebikeChargeTimeH = ebike && typeof ebike.chargeTimeH === 'number' ? ebike.chargeTimeH : null

  const jsonLd = buildProductJsonLd({ product, images, brandName: brand || null })

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-6 py-10 md:py-14">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/#prodotti"
            className="tap-target inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Torna ai prodotti
          </Link>
          <div className="text-white/45 text-xs tracking-widest uppercase font-semibold">Dettaglio prodotto</div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <ProductCarousel images={images} productName={product.name} />

          <section className="glass border border-white/12 rounded-[28px] p-6 md:p-8">
            <header>
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">{brand || '—'}</div>
              <h1 className="mt-3 font-display font-extrabold tracking-tight text-3xl md:text-4xl text-white">{product.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                  SKU: {sku || '—'}
                </div>
                <div className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                  {categoryLabel(category)}
                </div>
                {gender && (
                  <div className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                    {genderLabel(gender)}
                  </div>
                )}
                <div className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold">
                  {availabilityLabel(status)}
                </div>
              </div>
              {sizes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {sizes.slice(0, 10).map((s) => (
                    <div
                      key={s}
                      className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </header>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/4 border border-white/10 p-5">
                <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Prezzo</div>
                <div className="mt-3 flex items-baseline gap-2">
                  <div className={salePrice ? 'text-white/55 text-lg font-bold line-through' : 'text-white text-3xl font-extrabold'}>
                    {price || '—'}
                  </div>
                </div>
                {salePrice && (
                  <div className="mt-3">
                    <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Prezzo scontato</div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <div className="text-white text-3xl font-extrabold">{salePrice}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-white/4 border border-white/10 p-5">
                <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Disponibilità</div>
                <div className="mt-3 text-white text-xl font-extrabold">{availabilityLabel(status)}</div>
                <div className="mt-2 text-white/60 text-sm">{status === 'preorder' ? 'Disponibile su richiesta.' : 'Verifica in officina.'}</div>
              </div>
            </div>

            {Array.isArray((product as any).sizes) && (product as any).sizes.length > 0 && (
              <div className="mt-6">
                <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Taglie disponibili</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(product as any).sizes.map((s: any) => (
                    <div
                      key={String(s)}
                      className="px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold"
                    >
                      {String(s)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Descrizione</div>
              <div className="mt-3 text-white/80 leading-relaxed">{description || 'Dettagli in arrivo.'}</div>
            </div>

            {ebike && (
              <div className="mt-7">
                <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">E-bike</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ebikeBatteryWh !== null && (
                    <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                      <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Batteria</div>
                      <div className="mt-2 text-white text-lg font-extrabold">{ebikeBatteryWh} Wh</div>
                    </div>
                  )}
                  {ebikeRangeKm !== null && (
                    <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                      <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Autonomia</div>
                      <div className="mt-2 text-white text-lg font-extrabold">{ebikeRangeKm} km</div>
                    </div>
                  )}
                  {ebikeMotorW !== null && (
                    <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                      <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Motore</div>
                      <div className="mt-2 text-white text-lg font-extrabold">{ebikeMotorW} W</div>
                    </div>
                  )}
                  {ebikeTorqueNm !== null && (
                    <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                      <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Coppia</div>
                      <div className="mt-2 text-white text-lg font-extrabold">{ebikeTorqueNm} Nm</div>
                    </div>
                  )}
                  {ebikeChargeTimeH !== null && (
                    <div className="rounded-2xl bg-white/4 border border-white/10 p-4">
                      <div className="text-white/60 text-xs tracking-widest uppercase font-semibold">Tempo di ricarica</div>
                      <div className="mt-2 text-white text-lg font-extrabold">{ebikeChargeTimeH} h</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href={CONTACT_TEL_HREF} className="tap-target btn-primary px-6 py-4 font-bold flex-1 text-center">
                Chiama ora
              </a>
              <a
                href={CONTACT_WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target btn-secondary px-6 py-4 font-bold border border-white/12 flex-1 text-center"
              >
                Scrivi su WhatsApp
              </a>
            </div>
          </section>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}
