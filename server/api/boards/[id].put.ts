import type { Board } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !VALID_BOARD_ID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid board ID' })
  }

  const body = await readBody<Board>(event)
  const storage = useStorage('boards')

  const existing = await storage.getItem<Board>(id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  body.id = id
  body.createdAt = existing.createdAt
  body.updatedAt = new Date().toISOString()
  await storage.setItem(id, body)
  return body
})
