import { describe, it, expect, vi, beforeEach } from 'vitest'
import { normalize } from './board-storage'
import type { Board } from '~~/shared/types'

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 'default',
    title: 'Test',
    slug: 'test',
    settings: { background: { type: 'none', value: '' }, theme: { primary: '#000', neutral: '#888' } },
    sections: [],
    labels: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides
  }
}

describe('normalize', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('sets layout to "default" when missing', () => {
    const board = makeBoard()
    normalize(board)
    expect(board.layout).toBe('default')
  })

  it('keeps a valid layout', () => {
    const board = makeBoard({ layout: 'default' })
    normalize(board)
    expect(board.layout).toBe('default')
  })

  it('resets unknown layout to "default" and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const board = makeBoard({ layout: 'bogus' as never })
    normalize(board)
    expect(board.layout).toBe('default')
    expect(warn).toHaveBeenCalled()
  })

  it('clears unknown displayStyle on a widget and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const board = makeBoard({
      sections: [{
        id: 's1', title: 'S', layout: 'grid', columns: 3, collapsible: false, collapsed: false,
        showTitle: true, widgets: [{
          id: 'w1', kind: 'service-link', span: 1, displayStyle: 'bogus',
          options: {}, plugins: {}
        }], defaults: {}
      }]
    })
    normalize(board)
    expect(board.sections[0]!.widgets[0]!.displayStyle).toBeUndefined()
    expect(warn).toHaveBeenCalled()
  })

  it('keeps a valid displayStyle', () => {
    const board = makeBoard({
      sections: [{
        id: 's1', title: 'S', layout: 'grid', columns: 3, collapsible: false, collapsed: false,
        showTitle: true, widgets: [{
          id: 'w1', kind: 'service-link', span: 1, displayStyle: 'full',
          options: {}, plugins: {}
        }], defaults: {}
      }]
    })
    normalize(board)
    expect(board.sections[0]!.widgets[0]!.displayStyle).toBe('full')
  })

  it('drops headers for unknown layout IDs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const board = makeBoard({
      headers: {
        default: { left: [], center: [], right: [] },
        bogus: { left: [], center: [], right: [] }
      } as never
    })
    normalize(board)
    expect(board.headers?.default).toBeDefined()
    expect((board.headers as Record<string, unknown>).bogus).toBeUndefined()
    expect(warn).toHaveBeenCalled()
  })

  it('drops header items with unknown types', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const board = makeBoard({
      headers: {
        default: {
          left: [{ id: '1', type: 'brand' }, { id: '2', type: 'bogus' } as never],
          center: [],
          right: []
        }
      }
    })
    normalize(board)
    expect(board.headers?.default?.left).toHaveLength(1)
    expect(board.headers?.default?.left[0]?.type).toBe('brand')
    expect(warn).toHaveBeenCalled()
  })

  it('tolerates missing slot arrays by treating them as empty', () => {
    const board = makeBoard({
      headers: { default: {} as never }
    })
    normalize(board)
    expect(board.headers?.default?.left).toEqual([])
    expect(board.headers?.default?.center).toEqual([])
    expect(board.headers?.default?.right).toEqual([])
  })
})
