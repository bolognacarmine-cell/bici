const ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const IT_DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function isValidDateParts(year: number, month: number, day: number, hours = 0, minutes = 0) {
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hours &&
    date.getMinutes() === minutes
  )
}

export function normalizePromotionDateInput(input: unknown) {
  const raw = String(input ?? '').trim()
  if (!raw) return ''

  const isoDateOnly = raw.match(ISO_DATE_ONLY_RE)
  if (isoDateOnly) return raw

  const italian = raw.match(IT_DATE_RE)
  if (italian) {
    const day = Number.parseInt(italian[1], 10)
    const month = Number.parseInt(italian[2], 10)
    const year = Number.parseInt(italian[3], 10)
    const hours = italian[4] ? Number.parseInt(italian[4], 10) : 0
    const minutes = italian[5] ? Number.parseInt(italian[5], 10) : 0

    if (!isValidDateParts(year, month, day, hours, minutes)) return raw

    const isoDate = `${year}-${pad2(month)}-${pad2(day)}`
    return italian[4] ? `${isoDate}T${pad2(hours)}:${pad2(minutes)}` : isoDate
  }

  return raw
}

export function parsePromotionDateValue(input: unknown) {
  const normalized = normalizePromotionDateInput(input)
  if (!normalized) return null

  const isoDateOnly = normalized.match(ISO_DATE_ONLY_RE)
  if (isoDateOnly) {
    const year = Number.parseInt(isoDateOnly[1], 10)
    const month = Number.parseInt(isoDateOnly[2], 10)
    const day = Number.parseInt(isoDateOnly[3], 10)
    if (!isValidDateParts(year, month, day)) return null
    return new Date(year, month - 1, day, 0, 0, 0, 0).getTime()
  }

  const parsed = Date.parse(normalized)
  return Number.isFinite(parsed) ? parsed : null
}
