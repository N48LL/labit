import type { Board } from '~~/shared/types'

export default defineEventHandler(async () => {
  const storage = useStorage('boards')
  const keys = await storage.getKeys()
  const boards: Board[] = []

  for (const key of keys) {
    const board = await storage.getItem<Board>(key)
    if (board) boards.push(board)
  }

  return boards.sort((a, b) => a.title.localeCompare(b.title))
})
