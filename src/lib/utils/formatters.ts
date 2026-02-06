const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
]

export function formatPhone(phone: string): string {
  if (!phone) return ''
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }
  return phone
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `היום ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
  }
  if (diffDays === 1) {
    return `אתמול ${date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
  }
  return formatDateTime(dateStr)
}

export function getHebrewMonth(month: number): string {
  return HEBREW_MONTHS[month - 1] || ''
}

export function getHebrewMonthYear(month: number, year: number): string {
  return `${getHebrewMonth(month)} ${year}`
}
