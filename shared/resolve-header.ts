import type { Board } from './types'
import { LAYOUTS, type LayoutId } from './layouts'
import type { HeaderConfig } from './header-items'

export function resolveHeader(board: Board, layoutId: LayoutId): HeaderConfig {
  return board.headers?.[layoutId] ?? LAYOUTS[layoutId].defaultHeader
}
