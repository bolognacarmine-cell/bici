'use client'

import { useEffect, useState } from 'react'
import { updateData } from './actions'
import Link from 'next/link'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { SiteDataSchema, type SiteData } from '@/lib/site-data-schema'
import type { Product, Promotion } from '@/lib/site-data-schema'

const CATEGORY_OPTIONS = [
  { value: 'city', label: 'City' },
  { value: 'mtb', label: 'MTB' },
  { value: 'trekking', label: 'Trekking' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'road', label: 'Corsa' },
  { value: 'junior', label: 'Junior' },
  { value: 'ebike_city', label: 'E-bike City' },
  { value: 'ebike_trekking', label: 'E-bike Trekking' },
  { value: 'ebike_emtb', label: 'E-MTB' },
  { value: 'ebike_cargo', label: 'E-bike Cargo' },
  { value: 'accessory', label: 'Accessori' },
  { value: 'spare_part', label: 'Ricambi' },
] as const

const PRODUCT_STATUS_OPTIONS = [
  { value: 'available', label: 'Disponibile' },
  { value: 'out_of_stock', label: 'Esaurito' },
  { value: 'preorder', label: 'Preordine' },
  { value: 'discontinued', label: 'Fuori catalogo' },
] as const

const GENDER_OPTIONS = [
  { value: 'uomo', label: 'Uomo' },
  { value: 'donna', label: 'Donna' },
  { value: 'unisex', label: 'Unisex' },
] as const

const JUNIOR_WHEEL_SIZES = ['12"', '14"', '16"', '20"', '24"', '26"'] as const
const ADULT_ALPHA_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
const ROAD_FRAME_CM_SIZES = ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm', '58 cm', '60 cm', '62 cm'] as const
const MTB_FRAME_INCH_SIZES = ['13"', '15"', '17"', '19"', '21"'] as const

const PROMO_SCOPE_OPTIONS = [
  { value: 'general', label: 'Generale' },
  { value: 'category', label: 'Categoria' },
  { value: 'product', label: 'Prodotto' },
] as const

const PROMO_STATUS_OPTIONS = [
  { value: 'draft', label: 'Bozza' },
  { value: 'active', label: 'Attiva' },
  { value: 'scheduled', label: 'Programm.' },
  { value: 'expired', label: 'Scaduta' },
] as const

const PROMO_DISCOUNT_TYPE_OPTIONS = [
  { value: 'percent', label: '%' },
  { value: 'amount', label: '€' },
] as const

export default function AdminClientPage() {
  const [data, setData] = useState<SiteData | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/site-data', { cache: 'no-store' })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || ''
        const isJson = contentType.includes('application/json')
        const body = isJson ? await res.json() : await res.text()
        if (!res.ok) {
          const msg =
            typeof body === 'object' && body && 'error' in body ? String((body as any).error) : 'Errore durante il caricamento dati.'
          throw new Error(msg)
        }
        const parsed = SiteDataSchema.parse(body)
        if (!cancelled) setData(parsed)
      })
      .catch((e) => {
        if (!cancelled) setMessage(e instanceof Error ? e.message : 'Errore durante il caricamento dati.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    if (!data) return
    setSaving(true)
    try {
      await updateData(data)
      setMessage('Modifiche salvate con successo!')
      fetch('/api/site-data', { cache: 'no-store' })
        .then(async (res) => {
          const contentType = res.headers.get('content-type') || ''
          const isJson = contentType.includes('application/json')
          const body = isJson ? await res.json() : await res.text()
          if (!res.ok) return
          setData(SiteDataSchema.parse(body))
        })
        .catch(() => {})
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  const addPromotion = () => {
    if (!data) return
    const newPromotion = {
      title: '',
      scope: 'general',
      status: 'draft',
      discountType: 'percent',
      discountValue: 10,
      description: '',
      image: '/bici1.jpg',
    } satisfies Promotion
    const newPromotions: Promotion[] = [...(data.promotions ?? []), newPromotion]
    setData({ ...data, promotions: newPromotions })
  }

  const removePromotion = (index: number) => {
    if (!data) return
    const newPromotions = (data.promotions ?? []).filter((_, i) => i !== index)
    setData({ ...data, promotions: newPromotions })
  }

  const updatePromotion = (index: number, field: string, value: any) => {
    if (!data) return
    const newPromotions = [...(data.promotions ?? [])]
    newPromotions[index] = { ...newPromotions[index], [field]: value }
    setData({ ...data, promotions: newPromotions })
  }

  const addProduct = () => {
    if (!data) return
    const newProduct = {
      name: '',
      category: 'city',
      status: 'available',
      price: '',
      description: '',
      brand: '',
      image: '/bici1.jpg',
    } satisfies Product
    const newProducts: Product[] = [...(data.products ?? []), newProduct]
    setData({ ...data, products: newProducts })
  }

  const removeProduct = (index: number) => {
    if (!data) return
    const newProducts = (data.products ?? []).filter((_, i) => i !== index)
    setData({ ...data, products: newProducts })
  }

  const updateProduct = (index: number, field: string, value: any) => {
    if (!data) return
    const newProducts = [...(data.products ?? [])]
    newProducts[index] = { ...newProducts[index], [field]: value }
    setData({ ...data, products: newProducts })
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-100 p-8 font-sans text-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-zinc-800">Pannello Admin</h1>
              <p className="text-zinc-500">Caricamento dati…</p>
            </div>
            <Link href="/" className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
              Torna al sito
            </Link>
          </div>
          {message && <div className="mb-6 p-4 rounded-lg text-center font-medium bg-red-100 text-red-700">{message}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-8 font-sans text-zinc-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">Pannello Admin</h1>
            <p className="text-zinc-500">Gestione Promozioni e Prodotti</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
              Torna al sito
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#e67e22] text-white font-bold rounded-lg hover:bg-[#d35400] disabled:opacity-50 transition-all shadow-md"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-medium ${message.includes('Errore') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {message}
          </div>
        )}

        <div className="space-y-12 pb-20">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-zinc-800">Promozioni in corso</h2>
              <button
                onClick={addPromotion}
                className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold"
              >
                <Plus size={16} /> Aggiungi Promozione
              </button>
            </div>

            <div className="space-y-6">
              {data.promotions?.map((promo, idx) => (
                <div key={idx} className="p-6 border border-zinc-100 rounded-xl bg-zinc-50 relative group">
                  <button
                    onClick={() => removePromotion(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <div className="aspect-video bg-zinc-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                        <img src={String((promo as any).image || '/bici1.jpg')} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <ImageIcon className="text-white" />
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="URL Immagine"
                        value={String((promo as any).image ?? '')}
                        onChange={(e) => updatePromotion(idx, 'image', e.target.value)}
                        className="mt-2 w-full px-3 py-1 text-xs border border-zinc-200 rounded outline-none bg-white text-zinc-900 placeholder-zinc-400"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tipo promo</label>
                          <select
                            value={(promo as any).scope ?? 'general'}
                            onChange={(e) => updatePromotion(idx, 'scope', e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                          >
                            {PROMO_SCOPE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stato</label>
                          <select
                            value={(promo as any).status ?? 'draft'}
                            onChange={(e) => updatePromotion(idx, 'status', e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                          >
                            {PROMO_STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Sconto</label>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={(promo as any).discountType ?? 'percent'}
                              onChange={(e) => updatePromotion(idx, 'discountType', e.target.value)}
                              className="col-span-1 px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            >
                              {PROMO_DISCOUNT_TYPE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                            <input
                              className="col-span-2 px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                              type="number"
                              step="0.01"
                              value={Number((promo as any).discountValue ?? 10)}
                              onChange={(e) => updatePromotion(idx, 'discountValue', Number(e.target.value))}
                            />
                          </div>
                        </div>
                        {((promo as any).scope ?? 'general') === 'product' && (
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Prodotto</label>
                            <select
                              value={(promo as any).productSku ?? ''}
                              onChange={(e) => updatePromotion(idx, 'productSku', e.target.value === '' ? undefined : e.target.value)}
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            >
                              <option value="">Seleziona…</option>
                              {(data.products ?? []).map((p: any) => (
                                <option key={String(p.sku)} value={String(p.sku)}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {((promo as any).scope ?? 'general') === 'category' && (
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Categoria</label>
                            <select
                              value={(promo as any).category ?? 'city'}
                              onChange={(e) => updatePromotion(idx, 'category', e.target.value)}
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            >
                              {CATEGORY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Titolo Promo</label>
                        <input
                          type="text"
                          value={promo.title}
                          onChange={(e) => updatePromotion(idx, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none bg-white text-zinc-900 placeholder-zinc-400"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Inizio</label>
                          <input
                            type="date"
                            value={String((promo as any).startsAt ?? '')}
                            onChange={(e) => updatePromotion(idx, 'startsAt', e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Fine</label>
                          <input
                            type="date"
                            value={String((promo as any).endsAt ?? '')}
                            onChange={(e) => updatePromotion(idx, 'endsAt', e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Codice</label>
                          <input
                            type="text"
                            value={String((promo as any).code ?? '')}
                            onChange={(e) => updatePromotion(idx, 'code', e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 placeholder-zinc-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Mostra in home</label>
                          <select
                            value={String(Boolean((promo as any).showOnHome))}
                            onChange={(e) => updatePromotion(idx, 'showOnHome', e.target.value === 'true')}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                          >
                            <option value="false">No</option>
                            <option value="true">Sì</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrizione</label>
                        <textarea
                          value={String((promo as any).description ?? '')}
                          onChange={(e) => updatePromotion(idx, 'description', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none h-20 bg-white text-zinc-900 placeholder-zinc-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.promotions || data.promotions.length === 0) && (
                <p className="text-center text-zinc-400 py-8 italic">Nessuna promozione attiva</p>
              )}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-zinc-800">Catalogo Prodotti</h2>
              <button
                onClick={addProduct}
                className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold"
              >
                <Plus size={16} /> Aggiungi Prodotto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.products?.map((product, idx) => (
                <div key={idx} className="p-6 border border-zinc-100 rounded-xl bg-zinc-50 relative group">
                  <button
                    onClick={() => removeProduct(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="space-y-4">
                    <div className="aspect-square bg-zinc-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <img src={product.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <ImageIcon className="text-white" />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="URL Immagine"
                      value={product.image}
                      onChange={(e) => updateProduct(idx, 'image', e.target.value)}
                      className="w-full px-3 py-1 text-xs border border-zinc-200 rounded outline-none bg-white text-zinc-900 placeholder-zinc-400"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Categoria</label>
                        <select
                          value={(product as any).category ?? 'city'}
                          onChange={(e) => {
                            const nextCategory = e.target.value
                            const nextMode =
                              nextCategory === 'junior' ? 'inch' : nextCategory === 'road' ? 'cm' : nextCategory === 'mtb' ? 'alpha' : 'alpha'
                            updateProduct(idx, 'category', nextCategory)
                            updateProduct(idx, 'sizeMode', nextMode)
                            updateProduct(idx, 'sizes', [])
                          }}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                        >
                          {CATEGORY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stato</label>
                        <select
                          value={(product as any).status ?? 'available'}
                          onChange={(e) => updateProduct(idx, 'status', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                        >
                          {PRODUCT_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(() => {
                      const category = String((product as any).category ?? 'city')
                      const modeOptions =
                        category === 'junior'
                          ? (['inch'] as const)
                          : category === 'road'
                            ? (['cm'] as const)
                            : category === 'mtb'
                              ? (['alpha', 'inch'] as const)
                              : (['alpha'] as const)
                      const rawMode = String((product as any).sizeMode ?? '')
                      const currentMode = (modeOptions as readonly string[]).includes(rawMode)
                        ? (rawMode as (typeof modeOptions)[number])
                        : modeOptions[0]
                      const sizeOptions =
                        currentMode === 'inch'
                          ? category === 'junior'
                            ? JUNIOR_WHEEL_SIZES
                            : MTB_FRAME_INCH_SIZES
                          : currentMode === 'cm'
                            ? ROAD_FRAME_CM_SIZES
                            : ADULT_ALPHA_SIZES
                      const currentSizes = Array.isArray((product as any).sizes) ? ((product as any).sizes as string[]).map(String) : []
                      const toggleSize = (value: string) => {
                        const next = currentSizes.includes(value)
                          ? currentSizes.filter((s) => s !== value)
                          : [...currentSizes, value]
                        updateProduct(idx, 'sizeMode', currentMode)
                        updateProduct(idx, 'sizes', next)
                      }
                      return (
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-bold text-zinc-800">Taglie</div>
                              <div className="text-xs text-zinc-500 mt-1">
                                {category === 'junior'
                                  ? 'Bici bambino/a: misura ruota in pollici.'
                                  : category === 'road'
                                    ? 'Bici da corsa: taglie telaio in cm.'
                                    : category === 'mtb'
                                      ? 'MTB: standard oppure in pollici.'
                                      : 'Taglie standard adulto.'}
                              </div>
                            </div>
                            {modeOptions.length > 1 && (
                              <div className="w-44">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Formato</label>
                                <select
                                  value={currentMode}
                                  onChange={(e) => {
                                    updateProduct(idx, 'sizeMode', e.target.value)
                                    updateProduct(idx, 'sizes', [])
                                  }}
                                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 text-sm"
                                >
                                  <option value="alpha">XS–XXL</option>
                                  <option value="inch">Pollici</option>
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {sizeOptions.map((s) => {
                              const active = currentSizes.includes(s)
                              return (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => toggleSize(s)}
                                  className={
                                    active
                                      ? 'px-3 py-2 rounded-full bg-[#e67e22] text-white text-xs font-bold'
                                      : 'px-3 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-100'
                                  }
                                >
                                  {s}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome Prodotto</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none font-bold bg-white text-zinc-900 placeholder-zinc-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">SKU</label>
                        <input
                          type="text"
                          value={String((product as any).sku ?? '')}
                          onChange={(e) => updateProduct(idx, 'sku', e.target.value === '' ? undefined : e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 placeholder-zinc-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Slug</label>
                        <input
                          type="text"
                          value={String((product as any).slug ?? '')}
                          onChange={(e) => updateProduct(idx, 'slug', e.target.value === '' ? undefined : e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 placeholder-zinc-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Genere</label>
                        <select
                          value={String((product as any).gender ?? '')}
                          onChange={(e) => updateProduct(idx, 'gender', e.target.value || undefined)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                        >
                          <option value="">—</option>
                          {GENDER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Marca</label>
                        <input
                          type="text"
                          value={String((product as any).brand ?? '')}
                          onChange={(e) => updateProduct(idx, 'brand', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 placeholder-zinc-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Prezzo</label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none text-[#e67e22] font-bold bg-white placeholder-zinc-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Prezzo scontato</label>
                        <input
                          type="text"
                          value={String((product as any).salePrice ?? '')}
                          onChange={(e) => updateProduct(idx, 'salePrice', e.target.value === '' ? undefined : e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 placeholder-zinc-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrizione breve</label>
                      <input
                        type="text"
                        value={String((product as any).description ?? '')}
                        onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900 placeholder-zinc-400"
                      />
                    </div>
                    {String((product as any).category ?? '').startsWith('ebike_') && (
                      <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                        <div className="text-sm font-bold text-zinc-800">Dati e-bike</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Batteria (Wh)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.batteryWh ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  batteryWh: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Autonomia (km)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.rangeKm ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  rangeKm: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Motore (W)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.motorW ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  motorW: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Coppia (Nm)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.torqueNm ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  torqueNm: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Tempo ricarica (h)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={String((product as any).ebike?.chargeTimeH ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  chargeTimeH: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg outline-none bg-white text-zinc-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {(!data.products || data.products.length === 0) && <p className="text-center text-zinc-400 py-8 italic">Nessun prodotto in catalogo</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

