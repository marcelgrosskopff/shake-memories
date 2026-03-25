import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateAnonymousId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()

  const stored = localStorage.getItem('shake-anonymous-id')
  if (stored) return stored

  const id = crypto.randomUUID()
  localStorage.setItem('shake-anonymous-id', id)
  return id
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-AT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
