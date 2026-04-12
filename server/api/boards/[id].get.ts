import type { Board } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !VALID_BOARD_ID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid board ID' })
  }

  const storage = useStorage('boards')
  const board = await storage.getItem<Board>(id)

  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  return board
})
