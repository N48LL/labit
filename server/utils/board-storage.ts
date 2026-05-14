import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Board } from '~~/shared/types'
import { LAYOUTS } from '~~/shared/layouts'
import { WIDGET_KIND_STYLES } from '~~/shared/widget-kind-styles'
import { HEADER_ITEM_TYPES } from '~~/shared/header-items'
import { BOARDS_DIR } from './constants'

function boardPath(id: string): string {
  return join(BOARDS_DIR, `${id}.json`)
}

export function normalize(board: Board): Board {
  if (!board.layout || !(board.layout in LAYOUTS)) {
    if (board.layout) {
      console.warn(`[labbit] board "${board.id}" has unknown layout "${board.layout}", clearing`)
    }
    board.layout = 'default'
  }

  for (const section of board.sections) {
    for (const widget of section.widgets) {
      if (!widget.displayStyle) continue
      const valid = (WIDGET_KIND_STYLES as Record<string, readonly string[]>)[widget.kind] ?? []
      if (!valid.includes(widget.displayStyle)) {
        console.warn(
          `[labbit] widget "${widget.id}" has unknown displayStyle "${widget.displayStyle}" for kind "${widget.kind}", clearing`
        )
        delete widget.displayStyle
      }
    }
  }

  if (board.headers) {
    for (const layoutId of Object.keys(board.headers)) {
      if (!(layoutId in LAYOUTS)) {
        console.warn(`[labbit] board "${board.id}" has header for unknown layout "${layoutId}", dropping`)
        Reflect.deleteProperty(board.headers, layoutId)
        continue
      }
      const header = board.headers[layoutId as keyof typeof board.headers]
      if (!header) continue
      for (const slot of ['left', 'center', 'right'] as const) {
        const items = header[slot] ?? []
        header[slot] = items.filter((item) => {
          if ((HEADER_ITEM_TYPES as readonly string[]).includes(item.type)) return true
          console.warn(`[labbit] dropping unknown header item type "${item.type}" in board "${board.id}"`)
          return false
        })
      }
    }
  }

  return board
}

export async function readBoard(id: string): Promise<Board | null> {
  try {
    const raw = await readFile(boardPath(id), 'utf-8')
    return normalize(JSON.parse(raw) as Board)
  } catch {
    return null
  }
}

export async function writeBoard(board: Board): Promise<void> {
  await mkdir(BOARDS_DIR, { recursive: true })
  await writeFile(boardPath(board.id), JSON.stringify(board, null, 2), 'utf-8')
}

export async function listBoards(): Promise<Board[]> {
  let files: string[]
  try {
    files = await readdir(BOARDS_DIR)
  } catch {
    return []
  }

  const boards: Board[] = []
  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const board = await readBoard(file.slice(0, -5))
    if (board) boards.push(board)
  }
  return boards
}
