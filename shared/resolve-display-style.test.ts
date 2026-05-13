import { describe, it, expect } from 'vitest'
import { resolveDisplayStyle } from './resolve-display-style'

const validStyles = ['full', 'compact'] as const

describe('resolveDisplayStyle', () => {
  it('returns widget value when valid', () => {
    expect(resolveDisplayStyle('compact', 'full', 'full', validStyles)).toBe('compact')
  })

  it('falls back to layout default when widget value is undefined', () => {
    expect(resolveDisplayStyle(undefined, 'compact', 'full', validStyles)).toBe('compact')
  })

  it('falls back to kind default when widget and layout are undefined', () => {
    expect(resolveDisplayStyle(undefined, undefined, 'full', validStyles)).toBe('full')
  })

  it('falls through invalid widget value to layout default', () => {
    expect(resolveDisplayStyle('bogus', 'compact', 'full', validStyles)).toBe('compact')
  })

  it('falls through invalid widget AND layout values to kind default', () => {
    expect(resolveDisplayStyle('bogus', 'also-bogus', 'full', validStyles)).toBe('full')
  })

  it('returns kind default even when kind default is not in validStyles (defensive)', () => {
    expect(resolveDisplayStyle(undefined, undefined, 'unknown-but-trusted', validStyles)).toBe('unknown-but-trusted')
  })
})
