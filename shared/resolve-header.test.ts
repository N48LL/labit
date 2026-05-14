import { describe, it, expect } from 'vitest'
import { resolveHeader } from './resolve-header'
import { LAYOUTS } from './layouts'
import type { Board } from './types'

function makeBoard(headers?: Board['headers']): Board {
  return {
    id: 'b', title: 't', slug: 's',
    settings: { background: { type: 'none', value: '' }, theme: { primary: '#000', neutral: '#888' } },
    sections: [], labels: [],
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    headers
  }
}

describe('resolveHeader', () => {
  it('returns the board-saved header for the active layout when present', () => {
    const custom = { left: [], center: [{ id: 'x', type: 'clock' as const }], right: [] }
    const board = makeBoard({ default: custom })
    expect(resolveHeader(board, 'default')).toBe(custom)
  })

  it('falls back to the layout default when board has no override for the active layout', () => {
    const board = makeBoard()
    expect(resolveHeader(board, 'default')).toBe(LAYOUTS.default.defaultHeader)
  })

  it('uses layout default for layouts the board hasn\'t customized, even if other layouts are saved', () => {
    const custom = { left: [], center: [{ id: 'x', type: 'clock' as const }], right: [] }
    const board = makeBoard({ default: custom })
    expect(resolveHeader(board, 'rack')).toBe(LAYOUTS.rack.defaultHeader)
  })

  it('treats empty headers object as no overrides', () => {
    const board = makeBoard({})
    expect(resolveHeader(board, 'default')).toBe(LAYOUTS.default.defaultHeader)
  })
})
