import crypto from 'crypto'

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
}

export function isAdminConfigured() {
  return !!process.env.ADMIN_PASSWORD
}

export function getAdminUser() {
  return process.env.ADMIN_USER || 'admin'
}

function sign(payload: string) {
  const secret = getSecret()
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createAdminSession() {
  const secret = getSecret()
  if (!secret) return null
  const payload = JSON.stringify({ v: 1, iat: Date.now() })
  const sig = sign(payload)
  return `${Buffer.from(payload, 'utf8').toString('base64url')}.${sig}`
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}

export function verifyAdminSession(value: string | undefined | null) {
  const secret = getSecret()
  if (!secret) return false
  if (!value) return false
  const parts = value.split('.')
  if (parts.length !== 2) return false
  const [payloadB64, sig] = parts
  let payload = ''
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8')
  } catch {
    return false
  }
  const expected = sign(payload)
  if (!safeEqual(sig, expected)) return false
  try {
    const parsed = JSON.parse(payload)
    if (parsed?.v !== 1) return false
    return true
  } catch {
    return false
  }
}

export function verifyAdminCredentials(inputUser: string, inputPassword: string) {
  const user = getAdminUser()
  const password = process.env.ADMIN_PASSWORD || ''
  if (!password) return false
  if (inputUser !== user) return false
  return inputPassword === password
}

