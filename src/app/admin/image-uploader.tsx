'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type UploadedImage = {
  original_name?: string
  original_bytes?: number
  public_id: string
  secure_url: string
  mime_type: string
  format: string | null
  width: number | null
  height: number | null
  bytes: number | null
}

export type UploaderItem = {
  id: string
  fileName: string
  size: number
  mime: string
  previewUrl: string
  status: 'pending' | 'uploading' | 'uploaded' | 'error'
  error?: string
  uploaded?: UploadedImage
}

export type ImageItem = { url: string }

export function ImageUploader({
  apiBase,
  initialItems,
  disabled,
  onItemsChange,
}: {
  apiBase: string
  initialItems: ImageItem[]
  disabled?: boolean
  onItemsChange: (items: UploaderItem[]) => void
}) {
  const dropRef = useRef<HTMLDivElement | null>(null)
  const onChangeRef = useRef(onItemsChange)

  const [items, setItems] = useState<UploaderItem[]>(() => {
    const next: UploaderItem[] = []
    for (const it of initialItems) {
      const url = String(it?.url ?? '').trim()
      if (!url) continue
      next.push({
        id: crypto.randomUUID(),
        fileName: url.split('/').pop() || 'image',
        size: 0,
        mime: '',
        previewUrl: url,
        status: 'uploaded',
      })
    }
    return next
  })

  useEffect(() => {
    onChangeRef.current = onItemsChange
  }, [onItemsChange])

  useEffect(() => {
    onChangeRef.current(items)
  }, [items])

  const isAllowedMime = (mime: string) => {
    const m = String(mime || '').toLowerCase()
    if (m === 'image/jfif') return true
    return m === 'image/jpeg' || m === 'image/png' || m === 'image/webp' || m === 'image/avif'
  }

  const addLocalFiles = async (files: File[]) => {
    const next: UploaderItem[] = []
    for (const f of files) {
      const mime = String(f.type || '').toLowerCase()
      const size = typeof (f as any).size === 'number' ? (f as any).size : 0
      if (!isAllowedMime(mime)) {
        next.push({
          id: crypto.randomUUID(),
          fileName: f.name || 'clipboard-image',
          size,
          mime,
          previewUrl: '',
          status: 'error',
          error: 'Tipo file non supportato.',
        })
        continue
      }
      if (size > 10 * 1024 * 1024) {
        next.push({
          id: crypto.randomUUID(),
          fileName: f.name || 'clipboard-image',
          size,
          mime,
          previewUrl: '',
          status: 'error',
          error: 'File troppo grande (max 10MB).',
        })
        continue
      }

      const previewUrl = URL.createObjectURL(f)
      next.push({
        id: crypto.randomUUID(),
        fileName: f.name || 'clipboard-image',
        size,
        mime,
        previewUrl,
        status: 'pending',
      })
    }

    setItems((prev) => [...prev, ...next])

    for (const item of next) {
      if (item.status !== 'pending') continue
      try {
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: 'uploading' } : x)))

        const file = files.find((f) => (f.name || 'clipboard-image') === item.fileName && (f as any).size === item.size)
        if (!file) throw new Error('File non trovato.')

        const fd = new FormData()
        fd.append('files', file, file.name || 'image')

        const res = await fetch(`${apiBase}/api/promotions/upload-images`, { method: 'POST', body: fd })
        const contentType = res.headers.get('content-type') || ''
        const body = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => '')
        if (!res.ok) {
          const msg =
            typeof body === 'object' && body && 'error' in body
              ? String((body as any).error)
              : typeof body === 'string' && body.trim()
                ? body.trim()
                : 'Errore upload.'
          throw new Error(msg)
        }

        const uploaded = Array.isArray((body as any)?.uploaded) ? ((body as any).uploaded[0] as UploadedImage | undefined) : undefined
        if (!uploaded?.secure_url || !uploaded?.public_id) {
          const firstError =
            Array.isArray((body as any)?.errors) && (body as any).errors.length > 0 ? String((body as any).errors[0]?.error ?? '') : ''
          throw new Error(firstError || 'Upload incompleto.')
        }

        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'uploaded', uploaded, previewUrl: uploaded.secure_url } : x))
        )
      } catch (e) {
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, status: 'error', error: e instanceof Error ? e.message : 'Errore upload.' } : x))
        )
      }
    }
  }

  const removeImage = async (id: string) => {
    const target = items.find((x) => x.id === id)
    setItems((prev) => prev.filter((x) => x.id !== id))
    if (target?.uploaded?.public_id) {
      await fetch(`${apiBase}/api/promotions/image/${encodeURIComponent(target.uploaded.public_id)}`, { method: 'DELETE' }).catch(() => {})
    }
  }

  const moveImage = (id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id)
      if (idx < 0) return prev
      const nextIdx = idx + dir
      if (nextIdx < 0 || nextIdx >= prev.length) return prev
      const copy = [...prev]
      const tmp = copy[idx]
      copy[idx] = copy[nextIdx]
      copy[nextIdx] = tmp
      return copy
    })
  }

  const clearAll = async () => {
    const snapshot = [...items]
    setItems([])
    const uploaded = snapshot.map((x) => x.uploaded?.public_id).filter(Boolean) as string[]
    await Promise.all(
      uploaded.map((id) =>
        fetch(`${apiBase}/api/promotions/image/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {})
      )
    )
  }

  const hasUploading = useMemo(() => items.some((x) => x.status === 'pending' || x.status === 'uploading'), [items])

  return (
    <div>
      <div
        ref={dropRef}
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          if (disabled) return
          const list = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []
          if (list.length > 0) addLocalFiles(list)
        }}
        onPaste={(e) => {
          if (disabled) return
          const raw = e.clipboardData?.items ? Array.from(e.clipboardData.items) : []
          const files: File[] = []
          for (const it of raw) {
            if (it.kind !== 'file') continue
            if (!String(it.type || '').startsWith('image/')) continue
            const f = it.getAsFile()
            if (!f) continue
            const ext = f.type === 'image/png' ? 'png' : f.type === 'image/webp' ? 'webp' : 'jpg'
            const named = new File([f], `clipboard-${Date.now()}.${ext}`, { type: f.type })
            files.push(named)
          }
          if (files.length > 0) {
            e.preventDefault()
            addLocalFiles(files)
          }
        }}
        className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/40 px-4 py-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-zinc-200">Trascina, seleziona o incolla immagini</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-100 font-bold hover:bg-white/8 cursor-pointer">
            Seleziona file
            <input
              type="file"
              accept=".jpg,.jpeg,.jfif,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="hidden"
              disabled={disabled}
              onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : []
                ;(e.target as any).value = ''
                if (list.length > 0) addLocalFiles(list)
              }}
            />
            </label>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                disabled={disabled || hasUploading}
                className="inline-flex w-full sm:w-auto items-center justify-center px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 font-bold hover:bg-red-500/15 disabled:opacity-50"
              >
                Elimina
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <div className="text-xs text-zinc-400">CTRL+V per incollare direttamente qui.</div>
          <div className="text-xs text-zinc-500 min-w-0">
            {items.length === 0 ? (
              <span>Nessun file selezionato.</span>
            ) : (
              <span className="inline-flex min-w-0 gap-2">
                <span className="shrink-0">{items.length} file</span>
                <span className="min-w-0 truncate">Ultimo: {items[items.length - 1]?.fileName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((img, idx) => (
            <div key={img.id} className="rounded-2xl border border-white/10 bg-zinc-950/40 overflow-hidden">
              <div className="relative aspect-square bg-zinc-900/60">
                {img.previewUrl ? (
                  <img src={img.previewUrl} alt={img.fileName} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-xs text-zinc-400">Nessuna preview</div>
                )}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-xl bg-black/65 text-white text-xs font-bold">{idx + 1}</div>
              </div>
              <div className="p-2">
                <div className="min-w-0 text-[11px] font-semibold text-zinc-100 truncate">{img.fileName}</div>
                <div className="mt-1 text-[11px] text-zinc-400">
                  {img.status === 'uploading'
                    ? 'Upload...'
                    : img.status === 'uploaded'
                      ? 'Caricata'
                      : img.status === 'error'
                        ? img.error || 'Errore'
                        : 'In attesa'}
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveImage(img.id, -1)}
                      disabled={disabled || hasUploading || idx === 0}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-zinc-100 disabled:opacity-40"
                      title="Sposta su"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(img.id, 1)}
                      disabled={disabled || hasUploading || idx === items.length - 1}
                      className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-zinc-100 disabled:opacity-40"
                      title="Sposta giù"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    disabled={disabled || hasUploading}
                    className="h-9 w-full sm:w-auto px-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 font-bold disabled:opacity-50"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
