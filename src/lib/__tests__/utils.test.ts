import { describe, it, expect } from 'vitest'
import { cn, truncate, formatDate } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })
})

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('returns short strings unchanged', () => {
    expect(truncate('Hi', 5)).toBe('Hi')
  })
})

describe('formatDate', () => {
  it('formats a date string in German', () => {
    const result = formatDate('2024-10-25T00:00:00Z')
    expect(result).toContain('Oktober')
    expect(result).toContain('2024')
  })
})
