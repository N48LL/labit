import { describe, it, expect } from 'vitest'
import { isHeaderItemRemovable, cloneDefaultHeader } from './header-items'
import type { HeaderItem, HeaderConfig } from './header-items'

describe('isHeaderItemRemovable', () => {
  it('refuses to mark edit-theme-actions removable', () => {
    expect(isHeaderItemRemovable({ id: 'x', type: 'edit-theme-actions' })).toBe(false)
  })

  it('marks brand removable', () => {
    expect(isHeaderItemRemovable({ id: 'x', type: 'brand' })).toBe(true)
  })

  it('marks clock removable', () => {
    expect(isHeaderItemRemovable({ id: 'x', type: 'clock' })).toBe(true)
  })

  it('marks network-info removable', () => {
    expect(isHeaderItemRemovable({ id: 'x', type: 'network-info' })).toBe(true)
  })

  it('marks spacer removable', () => {
    expect(isHeaderItemRemovable({ id: 'x', type: 'spacer' })).toBe(true)
  })
})

describe('cloneDefaultHeader', () => {
  const defaults: HeaderConfig = {
    left: [{ id: 'h-brand', type: 'brand' }],
    center: [{ id: 'h-clock', type: 'clock', options: { format24h: true } }],
    right: [{ id: 'h-actions', type: 'edit-theme-actions' }]
  }

  it('regenerates every item id using the supplied generator', () => {
    let counter = 0
    const genId = () => `new-${counter++}`
    const cloned = cloneDefaultHeader(defaults, genId)
    expect(cloned.left[0]!.id).toBe('new-0')
    expect(cloned.center[0]!.id).toBe('new-1')
    expect(cloned.right[0]!.id).toBe('new-2')
  })

  it('preserves type and options on each cloned item', () => {
    const cloned = cloneDefaultHeader(defaults, () => 'fixed')
    expect(cloned.center[0]!.type).toBe('clock')
    expect(cloned.center[0]!.options).toEqual({ format24h: true })
  })

  it('does not share array references with the source', () => {
    const cloned = cloneDefaultHeader(defaults, () => 'fixed')
    expect(cloned.left).not.toBe(defaults.left)
    expect(cloned.center).not.toBe(defaults.center)
    expect(cloned.right).not.toBe(defaults.right)
  })

  it('produces unique ids when generator returns unique values', () => {
    let counter = 0
    const generated = cloneDefaultHeader(defaults, () => `id-${counter++}`)
    const allIds = [...generated.left, ...generated.center, ...generated.right].map((i: HeaderItem) => i.id)
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})
