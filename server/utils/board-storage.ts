import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { Board, BoardLayoutId } from '~~/shared/types'

const VALID_LAYOUTS: BoardLayoutId[] = ['hub', 'rack', 'operator']
const DEFAULT_LAYOUT: BoardLayoutId = 'hub'

function boardPath(id: string): string {
  return join(BOARDS_DIR, `${id}.json`)
}

function normalize(board: Board): Board {
  if (!board.layout || !VALID_LAYOUTS.includes(board.layout)) {
    if (board.layout && !VALID_LAYOUTS.includes(board.layout)) {
      console.warn(`[labbit] Board "${board.id}" has unknown layout "${board.layout}", falling back to "${DEFAULT_LAYOUT}".`)
    }
    board.layout = DEFAULT_LAYOUT
  }
  return board
}

export async function readBoard(id: string): Promise<Board | null> {
  try {
    const raw = await readFile(boardPath(id), 'utf-8')
    return normalize(JSON.parse(raw))
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
    try {
      const raw = await readFile(join(BOARDS_DIR, file), 'utf-8')
      boards.push(normalize(JSON.parse(raw)))
    } catch {
      // skip malformed files
    }
  }
  return boards
}
