import { apiRequest, setLoading, setToken, getToken, toast } from './api.js'

function setActiveTab(tab) {
  for (const btn of document.querySelectorAll('.tab')) {
    btn.classList.toggle('is-active', btn.dataset.tab === tab)
  }
  for (const form of document.querySelectorAll('.form')) {
    form.classList.toggle('is-active', form.id === `${tab}Form`)
  }
}

async function checkSession() {
  const token = getToken()
  if (!token) return
  try {
    await apiRequest('/api/auth/me')
    window.location.href = '/admin.html'
  } catch {
    setToken('')
    localStorage.removeItem('admin_token')
  }
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => setActiveTab(btn.dataset.tab))
  })
}

function setupForms() {
  const loginForm = document.getElementById('loginForm')
  const registerForm = document.getElementById('registerForm')

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(loginForm)
    const email = String(fd.get('email') || '').trim()
    const password = String(fd.get('password') || '')

    try {
      setLoading(true)
      const data = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } })
      setToken(data.token)
      toast('Login', 'Accesso effettuato con successo')
      window.location.href = '/admin.html'
    } catch (err) {
      toast('Errore', err.message || 'Login fallito', 'error')
    } finally {
      setLoading(false)
    }
  })

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(registerForm)
    const email = String(fd.get('email') || '').trim()
    const password = String(fd.get('password') || '')

    try {
      setLoading(true)
      const data = await apiRequest('/api/auth/register', { method: 'POST', body: { email, password } })
      setToken(data.token)
      toast('Account', 'Registrazione completata')
      window.location.href = '/admin.html'
    } catch (err) {
      toast('Errore', err.message || 'Registrazione fallita', 'error')
    } finally {
      setLoading(false)
    }
  })
}

setupTabs()
setupForms()
checkSession()

