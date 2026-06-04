const TOKEN_KEY = 'admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function setLoading(isLoading) {
  const el = document.getElementById('spinner')
  if (!el) return
  el.setAttribute('aria-hidden', isLoading ? 'false' : 'true')
}

export function toast(title, message, type = 'info') {
  const root = document.getElementById('toastRoot')
  if (!root) return

  const el = document.createElement('div')
  el.className = `toast${type === 'error' ? ' is-error' : ''}`
  el.innerHTML = `<div class="toast-title"></div><div class="toast-msg"></div>`
  el.querySelector('.toast-title').textContent = title
  el.querySelector('.toast-msg').textContent = message

  root.appendChild(el)
  setTimeout(() => {
    el.remove()
  }, 3800)
}

async function parseJsonSafe(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function apiRequest(path, { method = 'GET', body, headers = {}, formData } = {}) {
  const token = getToken()

  const h = new Headers(headers)
  if (token) h.set('Authorization', `Bearer ${token}`)

  const init = { method, headers: h }
  if (formData) {
    init.body = formData
  } else if (body !== undefined) {
    h.set('Content-Type', 'application/json')
    init.body = JSON.stringify(body)
  }

  const res = await fetch(path, init)
  const data = await parseJsonSafe(res)

  if (!res.ok) {
    const errMsg =
      (data && (data.error || (Array.isArray(data.errors) && data.errors[0]?.msg))) || `Request failed (${res.status})`
    const err = new Error(errMsg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

