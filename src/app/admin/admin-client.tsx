'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { SiteDataSchema, type SiteData } from '@/lib/site-data-schema'
import type { Product, Promotion } from '@/lib/site-data-schema'
import { MediaCarousel } from '@/components/media-carousel'
import { ImageUploader, type ImageItem, type UploaderItem } from './image-uploader'
import Image from 'next/image'

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
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')
  const euro = useMemo(() => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }), [])

  const [createTitle, setCreateTitle] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [createPriceInput, setCreatePriceInput] = useState('')
  const [createIsActive, setCreateIsActive] = useState(true)
  const [createImages, setCreateImages] = useState<UploaderItem[]>([])
  const [createImagesKey, setCreateImagesKey] = useState(0)
  const [createStatus, setCreateStatus] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [promoExpandedIndex, setPromoExpandedIndex] = useState<number | null>(null)
  const [promoSelectedIndexes, setPromoSelectedIndexes] = useState<number[]>([])
  const [promoEditIndex, setPromoEditIndex] = useState<number | null>(null)
  const [promoEditTitle, setPromoEditTitle] = useState('')
  const [promoEditDescription, setPromoEditDescription] = useState('')
  const [promoEditScope, setPromoEditScope] = useState<Promotion['scope']>('general')
  const [promoEditStatus, setPromoEditStatus] = useState<Promotion['status']>('draft')
  const [promoEditDiscountType, setPromoEditDiscountType] = useState<Promotion['discountType']>('percent')
  const [promoEditDiscountValueInput, setPromoEditDiscountValueInput] = useState('10')
  const [promoEditShowOnHome, setPromoEditShowOnHome] = useState(true)
  const [promoEditCategory, setPromoEditCategory] = useState<Promotion['category'] | ''>('')
  const [promoEditProductSku, setPromoEditProductSku] = useState('')
  const [promoEditStartsAt, setPromoEditStartsAt] = useState('')
  const [promoEditEndsAt, setPromoEditEndsAt] = useState('')
  const [promoEditPriceInput, setPromoEditPriceInput] = useState('')
  const [promoEditOfferActive, setPromoEditOfferActive] = useState(false)
  const [promoEditOfferPriceInput, setPromoEditOfferPriceInput] = useState('')
  const [promoEditCtaText, setPromoEditCtaText] = useState('')
  const [promoEditCtaHref, setPromoEditCtaHref] = useState('')
  const [promoEditMessage, setPromoEditMessage] = useState('')
  const [productSelectedIndexes, setProductSelectedIndexes] = useState<number[]>([])
  const [productEditIndex, setProductEditIndex] = useState<number | null>(null)
  const [productEditBackup, setProductEditBackup] = useState<string>('')
  const [productEditMessage, setProductEditMessage] = useState('')

  const parsePriceEur = (input: string) => {
    const raw = String(input || '').trim()
    if (!raw) return null
    const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    const n = Number.parseFloat(normalized)
    if (!Number.isFinite(n)) return null
    return Math.round(n * 100) / 100
  }

  const parseMoneyFlexible = (input: string) => {
    const raw = String(input || '').trim()
    if (!raw) return null
    const cleaned = raw.replace(/\s+/g, '').replace(/[€]/g, '').replace(/eur/gi, '')
    if (cleaned.includes('-')) return null
    const only = cleaned.replace(/[^\d.,]/g, '')
    if (!only) return null

    const lastComma = only.lastIndexOf(',')
    const lastDot = only.lastIndexOf('.')

    let normalized = only

    if (lastComma !== -1 && lastDot !== -1) {
      const decSep = lastComma > lastDot ? ',' : '.'
      const thouSep = decSep === ',' ? '.' : ','
      normalized = normalized.replaceAll(thouSep, '')
      normalized = normalized.replace(decSep, '.')
    } else if (lastComma !== -1) {
      const parts = normalized.split(',')
      if (parts.length > 2) {
        normalized = parts.join('')
      } else {
        const decimals = parts[1] ?? ''
        normalized = decimals.length >= 1 && decimals.length <= 2 ? parts[0] + '.' + decimals : parts.join('')
      }
    } else if (lastDot !== -1) {
      const parts = normalized.split('.')
      if (parts.length > 2) {
        normalized = parts.join('')
      } else {
        const decimals = parts[1] ?? ''
        normalized = decimals.length >= 1 && decimals.length <= 2 ? parts[0] + '.' + decimals : parts.join('')
      }
    }

    const n = Number.parseFloat(normalized)
    if (!Number.isFinite(n)) return null
    return Math.round(n * 100) / 100
  }

  const formatPercent = (value: number) => {
    const v = Math.round(value * 100) / 100
    return `${v.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`
  }

  const getOfferPreview = (originalEur: number | null, rawInput: string) => {
    const raw = String(rawInput || '').trim()
    if (!raw) {
      return {
        mode: null as null | 'percent' | 'eur',
        originalEur,
        discountPercent: null as number | null,
        finalOfferEur: null as number | null,
        savingsEur: null as number | null,
        error: '',
      }
    }

    const lower = raw.toLowerCase()
    const hasPercent = raw.includes('%')
    const hasEuro = raw.includes('€') || lower.includes('eur')

    const numeric = parseMoneyFlexible(raw)
    if (numeric === null) {
      return { mode: null, originalEur, discountPercent: null, finalOfferEur: null, savingsEur: null, error: 'Valore non valido.' }
    }

    const mode: 'percent' | 'eur' = hasPercent ? 'percent' : hasEuro ? 'eur' : numeric <= 100 ? 'percent' : 'eur'

    if (mode === 'percent') {
      if (originalEur === null) {
        return { mode, originalEur, discountPercent: null, finalOfferEur: null, savingsEur: null, error: 'Inserisci il prezzo base per calcolare la percentuale.' }
      }
      if (!(numeric > 0 && numeric < 100)) {
        return { mode, originalEur, discountPercent: null, finalOfferEur: null, savingsEur: null, error: 'La percentuale deve essere tra 1 e 99.' }
      }
      const finalOfferEur = Math.round(originalEur * (1 - numeric / 100) * 100) / 100
      const savingsEur = Math.round((originalEur - finalOfferEur) * 100) / 100
      if (!(finalOfferEur > 0)) {
        return { mode, originalEur, discountPercent: null, finalOfferEur: null, savingsEur: null, error: 'Prezzo offerta non valido.' }
      }
      return { mode, originalEur, discountPercent: numeric, finalOfferEur, savingsEur, error: '' }
    }

    if (!(numeric > 0)) {
      return { mode, originalEur, discountPercent: null, finalOfferEur: null, savingsEur: null, error: 'Il prezzo offerta deve essere maggiore di 0.' }
    }
    if (typeof originalEur === 'number' && numeric >= originalEur) {
      return { mode, originalEur, discountPercent: null, finalOfferEur: null, savingsEur: null, error: 'Il prezzo offerta deve essere inferiore al prezzo base.' }
    }
    const discountPercent = typeof originalEur === 'number' ? Math.round(((1 - numeric / originalEur) * 100) * 100) / 100 : null
    const savingsEur = typeof originalEur === 'number' ? Math.round((originalEur - numeric) * 100) / 100 : null
    return { mode, originalEur, discountPercent, finalOfferEur: numeric, savingsEur, error: '' }
  }

  const persistSiteData = async (nextData: unknown) => {
    const res = await fetch('/api/site-data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextData),
      credentials: 'include',
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      if (json && typeof json === 'object' && Array.isArray((json as any).issues)) {
        const issues = (json as any).issues as Array<any>
        const lines: string[] = []
        for (const it of issues) {
          const path = Array.isArray(it?.path) ? it.path : []
          const msg = String(it?.message ?? '').trim() || 'Campo non valido.'
          if (path[0] === 'products' && typeof path[1] === 'number') {
            const idx = Number(path[1]) + 1
            const field = path.slice(2).map(String).join('.')
            lines.push(`Prodotto ${idx}${field ? ` (${field})` : ''}: ${msg}`)
            continue
          }
          if (path[0] === 'promotions' && typeof path[1] === 'number') {
            const idx = Number(path[1]) + 1
            const field = path.slice(2).map(String).join('.')
            lines.push(`Promozione ${idx}${field ? ` (${field})` : ''}: ${msg}`)
            continue
          }
          lines.push(msg)
        }
        const shown = lines.slice(0, 10)
        const more = lines.length > shown.length ? `\n(+${lines.length - shown.length} altri errori)` : ''
        throw new Error(`Dati non validi:\n- ${shown.join('\n- ')}${more}`)
      }
      const msg = json && typeof json === 'object' && 'error' in json ? String((json as any).error) : 'Errore salvataggio.'
      throw new Error(msg)
    }
  }

  const confirmDelete = (label: string) => {
    const typed = window.prompt(`Conferma eliminazione: digita ELIMINA per ${label}.`)
    return String(typed ?? '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ') === 'ELIMINA'
  }

  const submitCreatePromotion = async () => {
    if (!data) return
    setCreateStatus('')

    const title = createTitle.trim()
    if (!title) {
      setCreateStatus('Titolo obbligatorio.')
      return
    }

    const price = parsePriceEur(createPriceInput)
    if (price === null) {
      setCreateStatus('Prezzo non valido.')
      return
    }

    const hasUploading = createImages.some((x) => x.status === 'pending' || x.status === 'uploading')
    if (hasUploading) {
      setCreateStatus('Attendi il completamento del caricamento immagini.')
      return
    }

    const images = createImages.filter((x) => x.status === 'uploaded' && x.uploaded)
    if (images.length === 0) {
      const firstErr = createImages.find((x) => x.status === 'error' && x.error)?.error
      setCreateStatus(firstErr || 'Carica almeno una immagine valida.')
      return
    }

    setCreating(true)
    try {
      const payload = {
        title,
        description: createDescription.trim(),
        price_eur: price,
        is_active: createIsActive,
        images: images.map((x, i) => ({
          ...x.uploaded,
          sort_order: i,
        })),
      }

      const res = await fetch(`${apiBase}/api/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = json && typeof json === 'object' && 'error' in json ? String((json as any).error) : 'Errore salvataggio.'
        throw new Error(msg)
      }

      const firstUrl = images[0].uploaded!.secure_url
      const sitePromotion = {
        title,
        scope: 'general',
        status: createIsActive ? 'active' : 'draft',
        discountType: 'percent',
        discountValue: 10,
        description: createDescription.trim(),
        image: firstUrl,
        images: images.map((x) => ({ url: x.uploaded!.secure_url, alt: title })),
        priceEur: price,
        offerActive: false,
        showOnHome: true,
      } satisfies Promotion

      const nextData = { ...data, promotions: [...(data.promotions ?? []), sitePromotion] }
      await persistSiteData(nextData)
      setData(nextData)

      setCreateTitle('')
      setCreateDescription('')
      setCreatePriceInput('')
      setCreateIsActive(true)
      setCreateImages([])
      setCreateImagesKey((k) => k + 1)
      setCreateStatus('Promozione creata e salvata.')
    } catch (e) {
      setCreateStatus(e instanceof Error ? e.message : 'Errore salvataggio.')
    } finally {
      setCreating(false)
    }
  }

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

  const normalizeSiteDataForSave = (input: SiteData): SiteData => {
    const normalizeExtensions = (raw: any) => {
      if (!Array.isArray(raw)) return undefined
      const cleaned = raw
        .map((x: any) => ({ label: String(x?.label ?? '').trim(), value: String(x?.value ?? '').trim() }))
        .filter((x: any) => x.label && x.value)
      return cleaned.length > 0 ? cleaned : undefined
    }

    const normalizeSizes = (raw: any) => {
      if (!Array.isArray(raw)) return undefined
      const cleaned = raw.map((x: any) => String(x ?? '').trim()).filter(Boolean)
      return cleaned.length > 0 ? cleaned : undefined
    }

    const products = Array.isArray(input.products)
      ? input.products.map((p: any) => {
          const fullDescription = String(p?.fullDescription ?? '').trim()
          return {
            ...p,
            fullDescription: fullDescription ? fullDescription : undefined,
            extensions: normalizeExtensions(p?.extensions),
            sizes: normalizeSizes(p?.sizes),
          }
        })
      : input.products

    return { ...input, products }
  }

  const saveAndReload = async (nextData: SiteData, successMessage: string) => {
    setSaving(true)
    try {
      const normalized = normalizeSiteDataForSave(nextData)
      setData(normalized)
      await persistSiteData(normalized)
      setMessage(successMessage)
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

  const handleSave = async () => {
    if (!data) return
    await saveAndReload(data, 'Modifiche salvate con successo!')
  }

  const handleSaveCatalogProducts = async () => {
    if (!data) return
    await saveAndReload(data, 'Catalogo prodotti creato e pubblicato sul sito!')
  }

  const clearAllPromotions = async () => {
    if (!data) return
    const promos = data.promotions ?? []
    if (promos.length === 0) return
    if (!confirmDelete('eliminare tutte le promozioni')) return
    setSaving(true)
    try {
      const nextData = { ...data, promotions: [] }
      setData(nextData)
      await persistSiteData(nextData)
      setPromoExpandedIndex(null)
      setPromoSelectedIndexes([])
      setPromoEditIndex(null)
      setPromoEditMessage('')
      setMessage('Promozioni eliminate.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
    } finally {
      setSaving(false)
    }
  }

  const togglePromoSelected = (idx: number) => {
    setPromoSelectedIndexes((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort((a, b) => a - b)))
  }

  const toggleSelectAllPromos = () => {
    const promos = data?.promotions ?? []
    if (promos.length === 0) return
    setPromoSelectedIndexes((prev) => (prev.length === promos.length ? [] : promos.map((_, i) => i)))
  }

  const deletePromotionAtIndex = async (idx: number) => {
    if (!data) return
    const promos = data.promotions ?? []
    if (idx < 0 || idx >= promos.length) return
    const title = String(promos[idx]?.title ?? '').trim()
    if (!confirmDelete(`eliminare la promozione${title ? ` “${title}”` : ''}`)) return

    setSaving(true)
    try {
      const nextPromos = promos.filter((_, i) => i !== idx)
      const nextData = { ...data, promotions: nextPromos }
      setData(nextData)
      await persistSiteData(nextData)
      setPromoExpandedIndex(null)
      setPromoSelectedIndexes([])
      setPromoEditIndex(null)
      setPromoEditMessage('')
      setMessage('Promozione eliminata.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
    } finally {
      setSaving(false)
    }
  }

  const deleteSelectedPromotions = async () => {
    if (!data) return
    const promos = data.promotions ?? []
    if (promos.length === 0) return
    const selected = promoSelectedIndexes.filter((i) => i >= 0 && i < promos.length)
    if (selected.length === 0) return
    if (
      !confirmDelete(
        `eliminare ${selected.length} promozion${selected.length === 1 ? 'e' : 'i'} selezionat${selected.length === 1 ? 'a' : 'e'}`
      )
    )
      return

    const toDelete = new Set(selected)
    setSaving(true)
    try {
      const nextPromos = promos.filter((_, i) => !toDelete.has(i))
      const nextData = { ...data, promotions: nextPromos }
      setData(nextData)
      await persistSiteData(nextData)
      setPromoExpandedIndex(null)
      setPromoSelectedIndexes([])
      setPromoEditIndex(null)
      setPromoEditMessage('')
      setMessage('Promozioni eliminate.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
    } finally {
      setSaving(false)
    }
  }

  const startEditPromotion = (idx: number) => {
    if (!data) return
    const promos = data.promotions ?? []
    const promo = promos[idx]
    if (!promo) return

    setPromoExpandedIndex(idx)
    setPromoEditIndex(idx)
    setPromoEditMessage('')
    setPromoEditTitle(String(promo.title ?? ''))
    setPromoEditDescription(String(promo.description ?? ''))
    setPromoEditScope(promo.scope ?? 'general')
    setPromoEditStatus(promo.status ?? 'draft')
    setPromoEditDiscountType(promo.discountType ?? 'percent')
    setPromoEditDiscountValueInput(String(typeof promo.discountValue === 'number' ? promo.discountValue : 10))
    setPromoEditShowOnHome(promo.showOnHome !== false)
    setPromoEditCategory(promo.category ?? '')
    setPromoEditProductSku(String(promo.productSku ?? ''))
    setPromoEditStartsAt(String(promo.startsAt ?? ''))
    setPromoEditEndsAt(String(promo.endsAt ?? ''))
    setPromoEditPriceInput(typeof promo.priceEur === 'number' ? euro.format(promo.priceEur) : '')
    setPromoEditOfferActive(Boolean(promo.offerActive))
    setPromoEditOfferPriceInput(typeof promo.offerPriceEur === 'number' ? euro.format(promo.offerPriceEur) : '')
    setPromoEditCtaText(String(promo.ctaText ?? ''))
    setPromoEditCtaHref(String(promo.ctaHref ?? ''))
  }

  const cancelEditPromotion = () => {
    setPromoEditIndex(null)
    setPromoEditMessage('')
  }

  const saveEditPromotion = async () => {
    if (!data) return
    if (promoEditIndex === null) return
    const promos = data.promotions ?? []
    const promo = promos[promoEditIndex]
    if (!promo) return

    const title = promoEditTitle.trim()
    if (!title) {
      setPromoEditMessage('Titolo obbligatorio.')
      return
    }

    const rawDiscount = String(promoEditDiscountValueInput || '').trim()
    if (!rawDiscount) {
      setPromoEditMessage('Valore sconto obbligatorio.')
      return
    }
    const discountNormalized = rawDiscount.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    const discountValue = Number.parseFloat(discountNormalized)
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      setPromoEditMessage('Valore sconto non valido.')
      return
    }
    if (promoEditDiscountType === 'percent' && (discountValue < 1 || discountValue > 100)) {
      setPromoEditMessage('Per le promo percentuali il valore deve essere tra 1 e 100.')
      return
    }

    if (promoEditScope === 'category' && !String(promoEditCategory || '').trim()) {
      setPromoEditMessage('Se la promo è su categoria, la categoria è obbligatoria.')
      return
    }
    if (promoEditScope === 'product' && !promoEditProductSku.trim()) {
      setPromoEditMessage('Se la promo è su prodotto, lo SKU prodotto è obbligatorio.')
      return
    }

    const priceRaw = promoEditPriceInput.trim()
    const priceEur = priceRaw ? parseMoneyFlexible(priceRaw) : null
    if (priceRaw && priceEur === null) {
      setPromoEditMessage('Prezzo non valido.')
      return
    }

    const offerPriceRaw = promoEditOfferPriceInput.trim()
    const offerPreview = getOfferPreview(typeof priceEur === 'number' ? priceEur : null, offerPriceRaw)
    const offerPriceEur = offerPriceRaw ? offerPreview.finalOfferEur : null
    if (promoEditOfferActive) {
      if (!offerPriceRaw || offerPriceEur === null) {
        setPromoEditMessage('Se l’offerta è attiva, il prezzo offerta è obbligatorio.')
        return
      }
      if (offerPreview.error) {
        setPromoEditMessage(offerPreview.error)
        return
      }
    }

    const nextPromo: Promotion = {
      ...promo,
      title,
      description: promoEditDescription.trim() || undefined,
      scope: promoEditScope,
      status: promoEditStatus,
      discountType: promoEditDiscountType,
      discountValue,
      showOnHome: promoEditShowOnHome,
      category: promoEditScope === 'category' ? (promoEditCategory || undefined) : undefined,
      productSku: promoEditScope === 'product' ? (promoEditProductSku.trim() || undefined) : undefined,
      startsAt: promoEditStartsAt.trim() || undefined,
      endsAt: promoEditEndsAt.trim() || undefined,
      priceEur: typeof priceEur === 'number' ? priceEur : undefined,
      offerActive: promoEditOfferActive ? true : false,
      offerPriceEur: promoEditOfferActive && typeof offerPriceEur === 'number' ? offerPriceEur : undefined,
      ctaText: promoEditCtaText.trim() || undefined,
      ctaHref: promoEditCtaHref.trim() || undefined,
    }

    setSaving(true)
    try {
      const nextPromos = promos.map((p, i) => (i === promoEditIndex ? nextPromo : p))
      const nextData = { ...data, promotions: nextPromos }
      const parsed = SiteDataSchema.parse(nextData)
      setData(parsed)
      await persistSiteData(parsed)
      setPromoEditIndex(null)
      setPromoEditMessage('')
      setMessage('Promozione aggiornata.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setPromoEditMessage(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  const toggleProductSelected = (idx: number) => {
    setProductSelectedIndexes((prev) => (prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort((a, b) => a - b)))
  }

  const toggleSelectAllProducts = () => {
    const products = data?.products ?? []
    if (products.length === 0) return
    setProductSelectedIndexes((prev) => (prev.length === products.length ? [] : products.map((_, i) => i)))
  }

  const deleteProductAtIndex = async (idx: number) => {
    if (!data) return
    const products = data.products ?? []
    if (idx < 0 || idx >= products.length) return
    const name = String(products[idx]?.name ?? '').trim()
    if (!confirmDelete(`eliminare il prodotto${name ? ` “${name}”` : ''}`)) return

    setSaving(true)
    try {
      const nextProducts = products.filter((_, i) => i !== idx)
      const nextData = { ...data, products: nextProducts }
      setData(nextData)
      await persistSiteData(nextData)
      setProductSelectedIndexes([])
      setMessage('Prodotto eliminato.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
    } finally {
      setSaving(false)
    }
  }

  const deleteSelectedProducts = async () => {
    if (!data) return
    const products = data.products ?? []
    if (products.length === 0) return
    const selected = productSelectedIndexes.filter((i) => i >= 0 && i < products.length)
    if (selected.length === 0) return
    if (
      !confirmDelete(
        `eliminare ${selected.length} prodott${selected.length === 1 ? 'o' : 'i'} selezionat${selected.length === 1 ? 'o' : 'i'}`
      )
    )
      return

    const toDelete = new Set(selected)
    setSaving(true)
    try {
      const nextProducts = products.filter((_, i) => !toDelete.has(i))
      const nextData = { ...data, products: nextProducts }
      setData(nextData)
      await persistSiteData(nextData)
      setProductSelectedIndexes([])
      setMessage('Prodotti eliminati.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
    } finally {
      setSaving(false)
    }
  }

  const clearAllProducts = async () => {
    if (!data) return
    const products = data.products ?? []
    if (products.length === 0) return
    if (!confirmDelete('eliminare tutti i prodotti del catalogo')) return
    setSaving(true)
    try {
      const nextData = { ...data, products: [] }
      setData(nextData)
      await persistSiteData(nextData)
      setProductSelectedIndexes([])
      setMessage('Catalogo prodotti eliminato.')
      setTimeout(() => setMessage(''), 3000)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Errore durante l’eliminazione.')
    } finally {
      setSaving(false)
    }
  }

  const startEditProduct = (idx: number) => {
    if (!data) return
    const products = data.products ?? []
    const product = products[idx]
    if (!product) return
    setProductEditIndex(idx)
    setProductEditMessage('')
    setProductEditBackup(JSON.stringify(product))
  }

  const cancelEditProduct = () => {
    if (!data) return
    if (productEditIndex === null) return
    if (!productEditBackup) {
      setProductEditIndex(null)
      setProductEditMessage('')
      return
    }
    try {
      const restored = JSON.parse(productEditBackup)
      const products = [...(data.products ?? [])]
      if (!products[productEditIndex]) {
        setProductEditIndex(null)
        setProductEditMessage('')
        return
      }
      products[productEditIndex] = restored
      setData({ ...data, products })
    } catch {
      // ignore restore errors
    } finally {
      setProductEditIndex(null)
      setProductEditMessage('')
      setProductEditBackup('')
    }
  }

  const saveEditProduct = async () => {
    if (!data) return
    if (productEditIndex === null) return
    setSaving(true)
    try {
      const parsed = SiteDataSchema.parse(data)
      await persistSiteData(parsed)
      setProductEditIndex(null)
      setProductEditMessage('')
      setProductEditBackup('')
      setMessage('Prodotto aggiornato.')
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
      setProductEditMessage(e instanceof Error ? e.message : 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
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
    } satisfies Product
    const newProducts: Product[] = [...(data.products ?? []), newProduct]
    setData({ ...data, products: newProducts })
    const nextIndex = newProducts.length - 1
    setProductEditIndex(nextIndex)
    setProductEditMessage('')
    setProductEditBackup(JSON.stringify(newProduct))
  }

  const removeProduct = (index: number) => {
    if (!data) return
    const newProducts = (data.products ?? []).filter((_, i) => i !== index)
    setData({ ...data, products: newProducts })
  }

  const updateProduct = (index: number, field: string, value: any) => {
    setData((prev) => {
      if (!prev) return prev
      const newProducts = [...(prev.products ?? [])]
      newProducts[index] = { ...newProducts[index], [field]: value }
      return { ...prev, products: newProducts }
    })
  }

  if (!data) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
        <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-white/10">
          <div className="mx-auto w-full max-w-5xl px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden shrink-0">
                  <img
                    src="/logo-vincenzobike.png?v=3"
                    alt="VincenzoBike"
                    width={44}
                    height={44}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-extrabold tracking-tight text-zinc-100 truncate">Pannello Admin</h1>
                  <p className="text-xs text-zinc-400 truncate">Caricamento dati…</p>
                </div>
              </div>
              <Link
                href="/"
                className="shrink-0 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-zinc-100 hover:bg-white/8"
              >
                Torna al sito
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-24">
          {message && (
            <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-200">
              {message}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 font-sans overflow-x-hidden">
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur border-b border-white/10">
        <div className="mx-auto w-full max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden shrink-0">
                <img src="/logo-vincenzobike.png?v=3" alt="VincenzoBike" width={44} height={44} className="h-10 w-10 object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold tracking-tight text-zinc-100 truncate">Pannello Admin</h1>
                <p className="text-xs text-zinc-400 truncate">Promozioni e prodotti</p>
              </div>
            </div>
            <Link
              href="/"
              className="shrink-0 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold text-zinc-100 hover:bg-white/8"
            >
              Torna al sito
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-32">
        {message && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${
              message.includes('Errore') ? 'border-red-500/25 bg-red-500/10 text-red-200' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-10">
          <section className="rounded-3xl border border-white/10 bg-white/3 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
              <h2 className="text-lg font-extrabold text-zinc-100">Promozioni</h2>
            </div>

            <div className="mb-8 rounded-3xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-zinc-100">Aggiungi promozione</div>
                  <div className="text-xs text-zinc-400">Trascina, seleziona o incolla immagini</div>
                </div>
                <button
                  type="button"
                  onClick={submitCreatePromotion}
                  disabled={creating}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                >
                  {creating ? 'Creazione...' : 'Crea promozione'}
                </button>
              </div>

              {createStatus && (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    createStatus.includes('creata') ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' : 'border-red-500/25 bg-red-500/10 text-red-200'
                  }`}
                >
                  {createStatus}
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Titolo promozione</label>
                  <input
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                    placeholder="Es. Promo Primavera"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Attiva</label>
                  <select
                    value={String(createIsActive)}
                    onChange={(e) => setCreateIsActive(e.target.value === 'true')}
                    className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                  >
                    <option value="true">Sì</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Descrizione</label>
                  <textarea
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none h-24 bg-black/30 text-zinc-100 placeholder-zinc-500"
                    placeholder="Testo breve della promozione"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo in euro</label>
                  <input
                    value={createPriceInput}
                    onChange={(e) => setCreatePriceInput(e.target.value)}
                    onBlur={() => {
                      const n = parsePriceEur(createPriceInput)
                      if (typeof n === 'number') setCreatePriceInput(euro.format(n))
                    }}
                    className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                    placeholder="Es. 12500,00 €"
                    inputMode="decimal"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Immagini</label>
                <ImageUploader
                  key={createImagesKey}
                  apiBase={apiBase}
                  initialItems={[]}
                  disabled={saving || creating}
                  onItemsChange={(next) => setCreateImages(next)}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-sm font-extrabold text-zinc-100">Elenco promozioni</div>
                  <div className="text-xs text-zinc-400">{(data.promotions ?? []).length} totali</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllPromos}
                    disabled={saving || creating || (data.promotions ?? []).length === 0}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-zinc-100 hover:bg-white/8 disabled:opacity-50"
                  >
                    {promoSelectedIndexes.length === (data.promotions ?? []).length && (data.promotions ?? []).length > 0 ? 'Deseleziona tutte' : 'Seleziona tutte'}
                  </button>
                  <button
                    type="button"
                    onClick={deleteSelectedPromotions}
                    disabled={saving || creating || promoSelectedIndexes.length === 0}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-extrabold text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                  >
                    Elimina selezionate
                  </button>
                  <button
                    type="button"
                    onClick={clearAllPromotions}
                    disabled={saving || creating || (data.promotions ?? []).length === 0}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-extrabold text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                  >
                    Elimina tutte
                  </button>
                </div>
              </div>

              {(data.promotions ?? []).length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-zinc-400">Nessuna promozione salvata.</div>
              ) : (
                <div className="space-y-3">
                  {(data.promotions ?? []).map((promo, idx) => {
                    const raw = promo.images
                    const items: Array<{ url: string; label?: string; alt?: string }> = []
                    if (Array.isArray(raw)) {
                      for (const entry of raw) {
                        if (typeof entry === 'string') {
                          const url = entry.trim()
                          if (!url) continue
                          items.push({ url })
                          continue
                        }
                        if (entry && typeof entry === 'object') {
                          const url = String(entry.url ?? '').trim()
                          if (!url) continue
                          const label = String(entry.label ?? '').trim()
                          const alt = String(entry.alt ?? '').trim()
                          items.push({ url, ...(label ? { label } : {}), ...(alt ? { alt } : {}) })
                        }
                      }
                    } else if (promo.image) {
                      const url = String(promo.image ?? '').trim()
                      if (url) items.push({ url })
                    }

                    const isSelected = promoSelectedIndexes.includes(idx)
                    const isExpanded = promoExpandedIndex === idx
                    const isEditing = promoEditIndex === idx
                    const discountLabel =
                      promo.discountType === 'amount' ? euro.format(promo.discountValue) : `${promo.discountValue}%`

                    return (
                      <div key={`${promo.title}-${idx}`} className="rounded-3xl border border-white/10 bg-black/30 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePromoSelected(idx)}
                              disabled={saving || creating}
                              className="mt-1 h-4 w-4"
                              aria-label={`Seleziona promozione ${promo.title}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-extrabold text-zinc-100 truncate">{promo.title}</div>
                                  <div className="mt-1 text-xs text-zinc-400">
                                    {promo.status} • {promo.scope} • {discountLabel}
                                    {promo.showOnHome === false ? ' • nascosta in home' : ''}
                                    {promo.startsAt ? ` • dal ${promo.startsAt}` : ''}
                                    {promo.endsAt ? ` • fino al ${promo.endsAt}` : ''}
                                  </div>
                                  {promo.description ? <div className="mt-2 text-sm text-zinc-300 line-clamp-2">{promo.description}</div> : null}
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => (isEditing ? cancelEditPromotion() : startEditPromotion(idx))}
                                    disabled={saving || creating}
                                    className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-100 font-extrabold hover:bg-white/8 disabled:opacity-50"
                                  >
                                    {isEditing ? 'Annulla' : 'Modifica'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPromoExpandedIndex((prev) => (prev === idx ? null : idx))}
                                    disabled={saving || creating}
                                    className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-100 font-extrabold hover:bg-white/8 disabled:opacity-50"
                                  >
                                    {isExpanded ? 'Chiudi' : 'Apri'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deletePromotionAtIndex(idx)}
                                    disabled={saving || creating}
                                    className="h-10 px-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 font-extrabold hover:bg-red-500/15 disabled:opacity-50"
                                  >
                                    Elimina
                                  </button>
                                </div>
                              </div>

                              {isExpanded ? (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                                  <div className="aspect-square bg-black/30 rounded-2xl overflow-hidden relative border border-white/10">
                                    {items.length > 0 ? (
                                      <MediaCarousel
                                        images={items.map((x) => x.url).filter(Boolean)}
                                        alt={promo.title}
                                        sizes="(max-width: 768px) 92vw, 520px"
                                        className="absolute inset-0"
                                        imageClassName="object-cover"
                                        objectPosition="50% 50%"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400">Nessuna immagine</div>
                                    )}
                                  </div>

                                  {isEditing ? (
                                    <div className="space-y-3 text-sm text-zinc-300">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="sm:col-span-2">
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Titolo</label>
                                          <input
                                            value={promoEditTitle}
                                            onChange={(e) => setPromoEditTitle(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          />
                                        </div>

                                        <div className="sm:col-span-2">
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Descrizione</label>
                                          <textarea
                                            value={promoEditDescription}
                                            onChange={(e) => setPromoEditDescription(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 h-24"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Stato</label>
                                          <select
                                            value={promoEditStatus}
                                            onChange={(e) => setPromoEditStatus(e.target.value as Promotion['status'])}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          >
                                            {PROMO_STATUS_OPTIONS.map((o) => (
                                              <option key={o.value} value={o.value}>
                                                {o.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Scope</label>
                                          <select
                                            value={promoEditScope}
                                            onChange={(e) => setPromoEditScope(e.target.value as Promotion['scope'])}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          >
                                            {PROMO_SCOPE_OPTIONS.map((o) => (
                                              <option key={o.value} value={o.value}>
                                                {o.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {promoEditScope === 'category' ? (
                                          <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Categoria</label>
                                            <select
                                              value={promoEditCategory}
                                              onChange={(e) => setPromoEditCategory(e.target.value as Promotion['category'])}
                                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                            >
                                              <option value="">Seleziona…</option>
                                              {CATEGORY_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                  {o.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        ) : null}

                                        {promoEditScope === 'product' ? (
                                          <div className="sm:col-span-2">
                                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">SKU prodotto</label>
                                            <input
                                              value={promoEditProductSku}
                                              onChange={(e) => setPromoEditProductSku(e.target.value)}
                                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                              list={`promo-sku-${idx}`}
                                            />
                                            <datalist id={`promo-sku-${idx}`}>
                                              {(data.products ?? [])
                                                .map((p) => (p.sku ?? '').trim())
                                                .filter(Boolean)
                                                .map((sku) => (
                                                  <option key={sku} value={sku} />
                                                ))}
                                            </datalist>
                                          </div>
                                        ) : null}

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Tipo sconto</label>
                                          <select
                                            value={promoEditDiscountType}
                                            onChange={(e) => setPromoEditDiscountType(e.target.value as Promotion['discountType'])}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          >
                                            {PROMO_DISCOUNT_TYPE_OPTIONS.map((o) => (
                                              <option key={o.value} value={o.value}>
                                                {o.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Valore sconto</label>
                                          <input
                                            value={promoEditDiscountValueInput}
                                            onChange={(e) => setPromoEditDiscountValueInput(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                            inputMode="decimal"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Mostra in home</label>
                                          <select
                                            value={String(promoEditShowOnHome)}
                                            onChange={(e) => setPromoEditShowOnHome(e.target.value === 'true')}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          >
                                            <option value="true">Sì</option>
                                            <option value="false">No</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo</label>
                                          <input
                                            value={promoEditPriceInput}
                                            onChange={(e) => setPromoEditPriceInput(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                            placeholder="Es. 12500,00 €"
                                            inputMode="decimal"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Offerta attiva</label>
                                          <select
                                            value={String(promoEditOfferActive)}
                                            onChange={(e) => setPromoEditOfferActive(e.target.value === 'true')}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          >
                                            <option value="false">No</option>
                                            <option value="true">Sì</option>
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo offerta</label>
                                          <input
                                            value={promoEditOfferPriceInput}
                                            onChange={(e) => setPromoEditOfferPriceInput(e.target.value)}
                                            onBlur={() => {
                                              const original = promoEditPriceInput.trim() ? parseMoneyFlexible(promoEditPriceInput) : null
                                              const preview = getOfferPreview(typeof original === 'number' ? original : null, promoEditOfferPriceInput)
                                              if (preview.error || preview.mode === null) return
                                              if (preview.mode === 'percent' && typeof preview.discountPercent === 'number') {
                                                setPromoEditOfferPriceInput(formatPercent(preview.discountPercent))
                                                return
                                              }
                                              if (preview.mode === 'eur' && typeof preview.finalOfferEur === 'number') {
                                                setPromoEditOfferPriceInput(euro.format(preview.finalOfferEur))
                                              }
                                            }}
                                            disabled={!promoEditOfferActive}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                                            placeholder="Es. 15% oppure 9900,00 €"
                                            inputMode="decimal"
                                          />
                                          {(() => {
                                            if (!promoEditOfferActive) return null
                                            const original = promoEditPriceInput.trim() ? parseMoneyFlexible(promoEditPriceInput) : null
                                            const preview = getOfferPreview(typeof original === 'number' ? original : null, promoEditOfferPriceInput)
                                            if (!promoEditOfferPriceInput.trim()) return null
                                            return (
                                              <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs">
                                                {preview.error ? (
                                                  <div className="font-semibold text-red-200">{preview.error}</div>
                                                ) : (
                                                  <div className="space-y-1 text-zinc-300">
                                                    <div className="flex items-center justify-between gap-2">
                                                      <div className="text-zinc-400">Prezzo base</div>
                                                      <div className="font-semibold text-zinc-100">
                                                        {typeof preview.originalEur === 'number' ? euro.format(preview.originalEur) : '—'}
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                      <div className="text-zinc-400">Sconto</div>
                                                      <div className="font-semibold text-zinc-100">
                                                        {typeof preview.discountPercent === 'number' ? formatPercent(preview.discountPercent) : '—'}
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                      <div className="text-zinc-400">Prezzo offerta</div>
                                                      <div className="font-semibold text-zinc-100">
                                                        {typeof preview.finalOfferEur === 'number' ? euro.format(preview.finalOfferEur) : '—'}
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                      <div className="text-zinc-400">Risparmi</div>
                                                      <div className="font-semibold text-zinc-100">
                                                        {typeof preview.savingsEur === 'number' ? euro.format(preview.savingsEur) : '—'}
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })()}
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Inizio (opz.)</label>
                                          <input
                                            value={promoEditStartsAt}
                                            onChange={(e) => setPromoEditStartsAt(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                            placeholder="Es. 2026-05-03T10:00:00Z"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Fine (opz.)</label>
                                          <input
                                            value={promoEditEndsAt}
                                            onChange={(e) => setPromoEditEndsAt(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                            placeholder="Es. 2026-05-20T10:00:00Z"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">CTA testo (opz.)</label>
                                          <input
                                            value={promoEditCtaText}
                                            onChange={(e) => setPromoEditCtaText(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">CTA link (opz.)</label>
                                          <input
                                            value={promoEditCtaHref}
                                            onChange={(e) => setPromoEditCtaHref(e.target.value)}
                                            className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100"
                                          />
                                        </div>
                                      </div>

                                      {promoEditMessage ? (
                                        <div
                                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                                            promoEditMessage.includes('Errore') ? 'border-red-500/25 bg-red-500/10 text-red-200' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
                                          }`}
                                        >
                                          {promoEditMessage}
                                        </div>
                                      ) : null}

                                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={saveEditPromotion}
                                          disabled={saving || creating}
                                          className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                          Salva modifica
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelEditPromotion}
                                          disabled={saving || creating}
                                          className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-zinc-100 hover:bg-white/8 disabled:opacity-50"
                                        >
                                          Annulla
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-3 text-sm text-zinc-300">
                                      <div className="grid grid-cols-1 gap-2">
                                        <div>
                                          <div className="text-xs font-bold text-zinc-400 uppercase">Sconto</div>
                                          <div className="font-semibold text-zinc-100">{discountLabel}</div>
                                        </div>
                                        {promo.scope === 'category' && promo.category ? (
                                          <div>
                                            <div className="text-xs font-bold text-zinc-400 uppercase">Categoria</div>
                                            <div className="font-semibold text-zinc-100">{promo.category}</div>
                                          </div>
                                        ) : null}
                                        {promo.scope === 'product' && promo.productSku ? (
                                          <div>
                                            <div className="text-xs font-bold text-zinc-400 uppercase">SKU prodotto</div>
                                            <div className="font-semibold text-zinc-100">{promo.productSku}</div>
                                          </div>
                                        ) : null}
                                        {typeof promo.priceEur === 'number' ? (
                                          <div>
                                            <div className="text-xs font-bold text-zinc-400 uppercase">Prezzo</div>
                                            <div className="font-semibold text-zinc-100">{euro.format(promo.priceEur)}</div>
                                          </div>
                                        ) : null}
                                        {promo.offerActive && typeof promo.offerPriceEur === 'number' ? (
                                          <div>
                                            <div className="text-xs font-bold text-zinc-400 uppercase">Prezzo offerta</div>
                                            <div className="font-semibold text-zinc-100">{euro.format(promo.offerPriceEur)}</div>
                                          </div>
                                        ) : null}
                                        {promo.ctaHref ? (
                                          <div>
                                            <div className="text-xs font-bold text-zinc-400 uppercase">Link CTA</div>
                                            <div className="font-semibold text-zinc-100 break-all">{promo.ctaHref}</div>
                                          </div>
                                        ) : null}
                                        {promo.internalNote ? (
                                          <div>
                                            <div className="text-xs font-bold text-zinc-400 uppercase">Nota interna</div>
                                            <div className="font-semibold text-zinc-100">{promo.internalNote}</div>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/3 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 border-b border-white/10 pb-4">
              <h2 className="text-lg font-extrabold text-zinc-100">Catalogo Prodotti</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <button
                  onClick={handleSaveCatalogProducts}
                  disabled={saving}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-zinc-100 hover:bg-white/8 disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Crea catalogo prodotti'}
                </button>
                <button
                  onClick={addProduct}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400"
                >
                  <Plus size={16} /> Aggiungi Prodotto
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
              <div>
                <div className="text-sm font-extrabold text-zinc-100">Elenco catalogo</div>
                <div className="text-xs text-zinc-400">{(data.products ?? []).length} prodotti</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAllProducts}
                  disabled={saving || (data.products ?? []).length === 0}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-zinc-100 hover:bg-white/8 disabled:opacity-50"
                >
                  {productSelectedIndexes.length === (data.products ?? []).length && (data.products ?? []).length > 0
                    ? 'Deseleziona tutti'
                    : 'Seleziona tutti'}
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedProducts}
                  disabled={saving || productSelectedIndexes.length === 0}
                  className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-extrabold text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                >
                  Elimina selezionati
                </button>
                <button
                  type="button"
                  onClick={clearAllProducts}
                  disabled={saving || (data.products ?? []).length === 0}
                  className="inline-flex items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-extrabold text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                >
                  Elimina tutti
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.products?.map((product, idx) => (
                <div key={idx} className="p-5 sm:p-6 border border-white/10 rounded-3xl bg-black/30 relative group">
                  {(() => {
                    const isEditing = productEditIndex === idx
                    return (
                      <div className="flex items-start justify-between gap-3">
                        <input
                          type="checkbox"
                          checked={productSelectedIndexes.includes(idx)}
                          onChange={() => toggleProductSelected(idx)}
                          disabled={saving}
                          className="mt-1 h-4 w-4"
                          aria-label={`Seleziona prodotto ${String(product.name ?? '')}`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => (isEditing ? cancelEditProduct() : startEditProduct(idx))}
                            disabled={saving}
                            className="h-10 px-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-100 font-extrabold hover:bg-white/8 disabled:opacity-50"
                          >
                            {isEditing ? 'Annulla' : 'Modifica'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProductAtIndex(idx)}
                            disabled={saving}
                            className="h-10 w-10 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 hover:bg-red-500/15 disabled:opacity-50 grid place-items-center"
                            aria-label="Elimina prodotto"
                            title="Elimina"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                  <div className="mt-4 space-y-4">
                    {(() => {
                      const isEditing = productEditIndex === idx
                      const raw = (product as any).images
                      const items: ImageItem[] = []
                      if (Array.isArray(raw)) {
                        for (const entry of raw) {
                          if (typeof entry === 'string') {
                            const url = entry.trim()
                            if (!url) continue
                            items.push({ url })
                            continue
                          }
                          if (entry && typeof entry === 'object') {
                            const url = String((entry as any).url ?? '').trim()
                            if (!url) continue
                            items.push({ url })
                          }
                        }
                      } else if ((product as any).image) {
                        const url = String((product as any).image).trim()
                        if (url) items.push({ url })
                      }

                      const setItems = (next: ImageItem[]) => {
                        const cleaned = next.map((x) => ({ url: String(x.url ?? '').trim() })).filter((x) => x.url.length > 0)
                        updateProduct(idx, 'images', cleaned.length > 0 ? cleaned.map((x) => x.url) : undefined)
                        updateProduct(idx, 'image', cleaned[0]?.url ?? undefined)
                      }

                      return (
                        <div>
                          <div className="aspect-square bg-black/30 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative z-0">
                            <MediaCarousel
                              images={items.map((x) => x.url).filter(Boolean)}
                              alt={String((product as any).name || 'Prodotto')}
                              sizes="(max-width: 768px) 92vw, 520px"
                              className="absolute inset-0"
                              imageClassName="object-cover"
                              objectPosition="50% 50%"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ImageIcon className="text-white" />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Immagini</label>
                            <ImageUploader
                              key={String((product as any).sku ?? idx)}
                              apiBase={apiBase}
                              initialItems={items}
                              disabled={saving || !isEditing}
                              onItemsChange={(nextItems) => {
                                const urls = nextItems
                                  .filter((x) => x.status === 'uploaded' && x.previewUrl)
                                  .map((x) => String(x.previewUrl).trim())
                                  .filter(Boolean)
                                setItems(urls.map((url) => ({ url })))
                              }}
                            />
                          </div>
                        </div>
                      )
                    })()}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Categoria</label>
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
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                        >
                          {CATEGORY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Stato</label>
                        <select
                          value={(product as any).status ?? 'available'}
                          onChange={(e) => updateProduct(idx, 'status', e.target.value)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
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
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-sm font-extrabold text-zinc-100">Taglie</div>
                              <div className="text-xs text-zinc-400 mt-1">
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
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Formato</label>
                                <select
                                  value={currentMode}
                                  onChange={(e) => {
                                    updateProduct(idx, 'sizeMode', e.target.value)
                                    updateProduct(idx, 'sizes', [])
                                  }}
                                  className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 text-sm"
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
                                  disabled={saving || productEditIndex !== idx}
                                  className={`px-3 py-2 rounded-full border text-xs font-extrabold disabled:opacity-50 ${
                                    active
                                      ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-100'
                                      : 'border-white/10 bg-white/5 text-zinc-100 hover:bg-white/8'
                                  }`}
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
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nome Prodotto</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                        disabled={saving || productEditIndex !== idx}
                        className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none font-extrabold bg-black/30 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">SKU</label>
                        <input
                          type="text"
                          value={String((product as any).sku ?? '')}
                          onChange={(e) => updateProduct(idx, 'sku', e.target.value === '' ? undefined : e.target.value)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Slug</label>
                        <input
                          type="text"
                          value={String((product as any).slug ?? '')}
                          onChange={(e) => updateProduct(idx, 'slug', e.target.value === '' ? undefined : e.target.value)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Genere</label>
                        <select
                          value={String((product as any).gender ?? '')}
                          onChange={(e) => updateProduct(idx, 'gender', e.target.value || undefined)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
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
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Marca</label>
                        <input
                          type="text"
                          value={String((product as any).brand ?? '')}
                          onChange={(e) => updateProduct(idx, 'brand', e.target.value)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={typeof (product as any).priceEur === 'number' ? Number((product as any).priceEur) : ''}
                          onChange={(e) =>
                            updateProduct(idx, 'priceEur', e.target.value === '' ? undefined : Number(e.target.value))
                          }
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none font-extrabold bg-black/30 text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo offerta (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={typeof (product as any).salePriceEur === 'number' ? Number((product as any).salePriceEur) : ''}
                          onChange={(e) =>
                            updateProduct(idx, 'salePriceEur', e.target.value === '' ? undefined : Number(e.target.value))
                          }
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo (testo)</label>
                        <input
                          type="text"
                          value={String((product as any).price ?? '')}
                          onChange={(e) => updateProduct(idx, 'price', e.target.value === '' ? undefined : e.target.value)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Prezzo offerta (testo)</label>
                        <input
                          type="text"
                          value={String((product as any).salePrice ?? '')}
                          onChange={(e) => updateProduct(idx, 'salePrice', e.target.value === '' ? undefined : e.target.value)}
                          disabled={saving || productEditIndex !== idx}
                          className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Descrizione breve</label>
                      <input
                        type="text"
                        value={String((product as any).description ?? '')}
                        onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                        disabled={saving || productEditIndex !== idx}
                        className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Dettagli (testo)</label>
                      <textarea
                        value={String((product as any).fullDescription ?? '')}
                        onChange={(e) => updateProduct(idx, 'fullDescription', e.target.value === '' ? undefined : e.target.value)}
                        disabled={saving || productEditIndex !== idx}
                        className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500 h-32"
                        placeholder="Dettagli completi del prodotto (materiali, componenti, note, utilizzo...)"
                      />
                    </div>
                    {(() => {
                      const raw = (product as any).extensions
                      const extensions: Array<{ label: string; value: string }> = Array.isArray(raw)
                        ? raw.map((x: any) => ({
                            label: String(x?.label ?? ''),
                            value: String(x?.value ?? ''),
                          }))
                        : []

                      const setExtensions = (next: Array<{ label: string; value: string }>) => {
                        const normalized = next.map((x) => ({
                          label: String(x.label ?? ''),
                          value: String(x.value ?? ''),
                        }))
                        updateProduct(idx, 'extensions', normalized.length > 0 ? normalized : undefined)
                      }

                      return (
                        <div>
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Dettagli tecnici</label>
                            <button
                              type="button"
                              onClick={() => setExtensions([...extensions, { label: '', value: '' }])}
                              disabled={saving || productEditIndex !== idx}
                              className="text-xs font-extrabold text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
                            >
                              + Aggiungi
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(extensions.length > 0 ? extensions : []).map((ext, extIndex) => (
                              <div key={extIndex} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                                <input
                                  type="text"
                                  placeholder="Etichetta"
                                  value={ext.label}
                                  onChange={(e) => {
                                    const next = [...extensions]
                                    next[extIndex] = { ...next[extIndex], label: e.target.value }
                                    setExtensions(next)
                                  }}
                                  disabled={saving || productEditIndex !== idx}
                                  className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Valore"
                                  value={ext.value}
                                  onChange={(e) => {
                                    const next = [...extensions]
                                    next[extIndex] = { ...next[extIndex], value: e.target.value }
                                    setExtensions(next)
                                  }}
                                  disabled={saving || productEditIndex !== idx}
                                  className="w-full px-4 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 placeholder-zinc-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...extensions]
                                    next.splice(extIndex, 1)
                                    setExtensions(next)
                                  }}
                                  disabled={saving || productEditIndex !== idx}
                                  className="h-11 w-full md:w-auto px-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 font-extrabold disabled:opacity-50"
                                >
                                  Rimuovi
                                </button>
                              </div>
                            ))}
                            {extensions.length === 0 && <div className="text-xs text-zinc-500">Nessun dettaglio tecnico.</div>}
                          </div>
                        </div>
                      )
                    })()}
                    {String((product as any).category ?? '').startsWith('ebike_') && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                        <div className="text-sm font-extrabold text-zinc-100">Dati e-bike</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Batteria (Wh)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.batteryWh ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  batteryWh: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              disabled={saving || productEditIndex !== idx}
                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Autonomia (km)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.rangeKm ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  rangeKm: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              disabled={saving || productEditIndex !== idx}
                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Motore (W)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.motorW ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  motorW: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              disabled={saving || productEditIndex !== idx}
                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Coppia (Nm)</label>
                            <input
                              type="number"
                              value={String((product as any).ebike?.torqueNm ?? '')}
                              onChange={(e) =>
                                updateProduct(idx, 'ebike', {
                                  ...(product as any).ebike,
                                  torqueNm: e.target.value === '' ? undefined : Number(e.target.value),
                                })
                              }
                              disabled={saving || productEditIndex !== idx}
                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Tempo ricarica (h)</label>
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
                              disabled={saving || productEditIndex !== idx}
                              className="w-full px-3 py-3 border border-white/10 rounded-2xl outline-none bg-black/30 text-zinc-100 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {productEditIndex === idx ? (
                      <>
                        {productEditMessage ? (
                          <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                            {productEditMessage}
                          </div>
                        ) : null}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <button
                            type="button"
                            onClick={saveEditProduct}
                            disabled={saving}
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
                          >
                            Salva modifica
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditProduct}
                            disabled={saving}
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-extrabold text-zinc-100 hover:bg-white/8 disabled:opacity-50"
                          >
                            Annulla
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {(!data.products || data.products.length === 0) && <p className="text-center text-zinc-400 py-8 italic">Nessun prodotto in catalogo</p>}
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-white/10 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            {saving ? 'Salvataggio in corso…' : 'Le modifiche vengono applicate a promozioni e prodotti.'}
          </div>
        </div>
      </div>
    </div>
  )
}

