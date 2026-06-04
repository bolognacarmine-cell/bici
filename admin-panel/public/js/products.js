import { apiRequest, clearToken, setLoading, toast } from './api.js'

const els = {
  logoutBtn: document.getElementById('logoutBtn'),
  refreshBtn: document.getElementById('refreshBtn'),
  newProductBtn: document.getElementById('newProductBtn'),
  productsTotal: document.getElementById('productsTotal'),
  ordersTotal: document.getElementById('ordersTotal'),
  revenueTotal: document.getElementById('revenueTotal'),
  searchInput: document.getElementById('searchInput'),
  limitSelect: document.getElementById('limitSelect'),
  tbody: document.getElementById('productsTbody'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  pageLabel: document.getElementById('pageLabel'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  productForm: document.getElementById('productForm'),
  fileInput: document.getElementById('fileInput'),
  dropzone: document.getElementById('dropzone'),
  previewGrid: document.getElementById('previewGrid'),
}

let state = {
  page: 1,
  limit: Number(els.limitSelect?.value || 12),
  q: '',
  totalPages: 1,
  items: [],
  editingId: null,
  images: [],
}

function formatCurrency(value) {
  try {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))
  } catch {
    return `€${Number(value || 0).toFixed(2)}`
  }
}

function openModal(title) {
  els.modalTitle.textContent = title
  els.modal.setAttribute('aria-hidden', 'false')
}

function closeModal() {
  els.modal.setAttribute('aria-hidden', 'true')
  state.editingId = null
  state.images = []
  els.productForm.reset()
  els.productForm.elements.active.checked = true
  renderPreview()
}

function getFormValues() {
  const fd = new FormData(els.productForm)
  return {
    name: String(fd.get('name') || '').trim(),
    category: String(fd.get('category') || '').trim(),
    price: Number(fd.get('price') || 0),
    stock: Number(fd.get('stock') || 0),
    description: String(fd.get('description') || '').trim(),
    active: els.productForm.elements.active.checked,
  }
}

function renderPreview() {
  els.previewGrid.innerHTML = ''

  for (const img of state.images) {
    const wrap = document.createElement('div')
    wrap.className = 'preview'

    const image = document.createElement('img')
    image.src = img.url
    image.alt = 'preview'
    wrap.appendChild(image)

    const actions = document.createElement('div')
    actions.className = 'preview-actions'

    if (img._temp) {
      const label = document.createElement('button')
      label.type = 'button'
      label.className = 'mini-btn'
      label.textContent = 'In attesa'
      label.disabled = true
      actions.appendChild(label)
    }

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.className = 'mini-btn danger'
    remove.textContent = 'Rimuovi'
    remove.addEventListener('click', () => removeImage(img))
    actions.appendChild(remove)

    wrap.appendChild(actions)
    els.previewGrid.appendChild(wrap)
  }
}

async function removeImage(img) {
  try {
    if (img._temp) {
      state.images = state.images.filter((x) => x._id !== img._id)
      renderPreview()
      return
    }

    if (img.public_id) {
      setLoading(true)
      await apiRequest(`/api/upload/image/${encodeURIComponent(img.public_id)}`, { method: 'DELETE' })
    }

    state.images = state.images.filter((x) => x.public_id !== img.public_id)
    renderPreview()
  } catch (err) {
    toast('Errore', err.message || 'Impossibile eliminare immagine', 'error')
  } finally {
    setLoading(false)
  }
}

function addFiles(files) {
  const arr = Array.from(files || [])
  for (const f of arr) {
    const url = URL.createObjectURL(f)
    state.images.push({ _id: crypto.randomUUID(), _temp: true, file: f, url })
  }
  renderPreview()
}

async function ensureAuth() {
  try {
    await apiRequest('/api/auth/me')
  } catch {
    clearToken()
    window.location.href = '/index.html'
  }
}

async function loadStats() {
  const data = await apiRequest('/api/admin/stats')
  els.productsTotal.textContent = String(data.productsTotal ?? 0)
  els.ordersTotal.textContent = String(data.ordersTotal ?? 0)
  els.revenueTotal.textContent = formatCurrency(data.revenue ?? 0)
}

function renderTable() {
  els.tbody.innerHTML = ''

  if (!Array.isArray(state.items) || state.items.length === 0) {
    const tr = document.createElement('tr')
    tr.innerHTML = `<td colspan="6" style="color: rgba(255,255,255,0.65); padding: 16px;">Nessun prodotto</td>`
    els.tbody.appendChild(tr)
    return
  }

  for (const p of state.items) {
    const tr = document.createElement('tr')

    const activeBadge = p.active
      ? '<span class="badge is-ok">Attivo</span>'
      : '<span class="badge is-off">Off</span>'

    tr.innerHTML = `
      <td>${p.name ?? ''}</td>
      <td>${p.category ?? ''}</td>
      <td>${formatCurrency(p.price ?? 0)}</td>
      <td>${Number(p.stock ?? 0)}</td>
      <td>${activeBadge}</td>
      <td class="row-actions">
        <button class="btn btn-ghost" data-action="edit" data-id="${p._id}">Modifica</button>
        <button class="btn" style="border-color: rgba(255,77,109,0.35);" data-action="delete" data-id="${p._id}">Elimina</button>
      </td>
    `

    tr.querySelector('[data-action="edit"]').addEventListener('click', () => openEdit(p._id))
    tr.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProduct(p._id))

    els.tbody.appendChild(tr)
  }
}

async function loadProducts() {
  const qs = new URLSearchParams()
  qs.set('page', String(state.page))
  qs.set('limit', String(state.limit))
  if (state.q) qs.set('q', state.q)

  const data = await apiRequest(`/api/products?${qs.toString()}`)
  state.items = data.items || []
  state.totalPages = data.totalPages || 1
  els.pageLabel.textContent = `Pagina ${data.page || 1} / ${state.totalPages}`
  renderTable()
}

async function openNew() {
  state.editingId = null
  state.images = []
  els.productForm.reset()
  els.productForm.elements.active.checked = true
  renderPreview()
  openModal('Nuovo prodotto')
}

async function openEdit(id) {
  try {
    setLoading(true)
    const data = await apiRequest(`/api/products/${id}`)
    const p = data.item
    state.editingId = p._id
    els.productForm.elements.id.value = p._id
    els.productForm.elements.name.value = p.name ?? ''
    els.productForm.elements.category.value = p.category ?? ''
    els.productForm.elements.price.value = Number(p.price ?? 0)
    els.productForm.elements.stock.value = Number(p.stock ?? 0)
    els.productForm.elements.description.value = p.description ?? ''
    els.productForm.elements.active.checked = Boolean(p.active)

    state.images = Array.isArray(p.images) ? p.images.filter(Boolean) : []
    renderPreview()
    openModal('Modifica prodotto')
  } catch (err) {
    toast('Errore', err.message || 'Impossibile caricare prodotto', 'error')
  } finally {
    setLoading(false)
  }
}

async function deleteProduct(id) {
  const ok = window.confirm('Confermi eliminazione prodotto? Verranno eliminate anche le immagini associate.')
  if (!ok) return

  try {
    setLoading(true)
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' })
    toast('Prodotto', 'Eliminato')
    await Promise.all([loadProducts(), loadStats()])
  } catch (err) {
    toast('Errore', err.message || 'Eliminazione fallita', 'error')
  } finally {
    setLoading(false)
  }
}

async function uploadPendingImages() {
  const pending = state.images.filter((img) => img._temp && img.file)
  if (pending.length === 0) return []

  const fd = new FormData()
  for (const img of pending) fd.append('images', img.file)

  const data = await apiRequest('/api/upload/images', { method: 'POST', formData: fd })
  return Array.isArray(data.images) ? data.images : []
}

async function saveProduct(e) {
  e.preventDefault()
  const v = getFormValues()

  if (!v.name) {
    toast('Errore', 'Nome obbligatorio', 'error')
    return
  }
  if (!Number.isFinite(v.price) || v.price <= 0) {
    toast('Errore', 'Prezzo deve essere > 0', 'error')
    return
  }

  try {
    setLoading(true)
    const uploaded = await uploadPendingImages()

    const keep = state.images.filter((img) => !img._temp).map((img) => ({ public_id: img.public_id, url: img.url }))
    const images = [...keep, ...uploaded]

    const payload = { ...v, images }

    if (state.editingId) {
      await apiRequest(`/api/products/${state.editingId}`, { method: 'PUT', body: payload })
      toast('Prodotto', 'Aggiornato')
    } else {
      await apiRequest('/api/products', { method: 'POST', body: payload })
      toast('Prodotto', 'Creato')
    }

    closeModal()
    await Promise.all([loadProducts(), loadStats()])
  } catch (err) {
    toast('Errore', err.message || 'Salvataggio fallito', 'error')
  } finally {
    setLoading(false)
  }
}

function setupModal() {
  els.modal.addEventListener('click', (e) => {
    const target = e.target
    if (target?.dataset?.close) closeModal()
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.modal.getAttribute('aria-hidden') === 'false') closeModal()
  })
}

function setupUploader() {
  els.fileInput.addEventListener('change', (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  })

  els.dropzone.addEventListener('dragover', (e) => {
    e.preventDefault()
    els.dropzone.classList.add('is-over')
  })
  els.dropzone.addEventListener('dragleave', () => els.dropzone.classList.remove('is-over'))
  els.dropzone.addEventListener('drop', (e) => {
    e.preventDefault()
    els.dropzone.classList.remove('is-over')
    addFiles(e.dataTransfer.files)
  })
}

function setupControls() {
  els.logoutBtn.addEventListener('click', () => {
    clearToken()
    window.location.href = '/index.html'
  })

  els.refreshBtn.addEventListener('click', async () => {
    try {
      setLoading(true)
      await Promise.all([loadProducts(), loadStats()])
      toast('Dashboard', 'Aggiornata')
    } catch (err) {
      toast('Errore', err.message || 'Aggiornamento fallito', 'error')
    } finally {
      setLoading(false)
    }
  })

  els.newProductBtn.addEventListener('click', openNew)

  els.searchInput.addEventListener('input', () => {
    state.q = els.searchInput.value.trim()
    state.page = 1
    loadProducts().catch(() => {})
  })

  els.limitSelect.addEventListener('change', () => {
    state.limit = Number(els.limitSelect.value || 12)
    state.page = 1
    loadProducts().catch(() => {})
  })

  els.prevPageBtn.addEventListener('click', () => {
    if (state.page <= 1) return
    state.page -= 1
    loadProducts().catch(() => {})
  })

  els.nextPageBtn.addEventListener('click', () => {
    if (state.page >= state.totalPages) return
    state.page += 1
    loadProducts().catch(() => {})
  })

  els.productForm.addEventListener('submit', saveProduct)
}

await ensureAuth()
setupModal()
setupUploader()
setupControls()

try {
  setLoading(true)
  await Promise.all([loadStats(), loadProducts()])
} finally {
  setLoading(false)
}

