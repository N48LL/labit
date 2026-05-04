import type { Board } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !VALID_BOARD_ID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid board ID' })
  }

  const body = await readBody<Board>(event)

  const existing = await readBoard(id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  body.id = id
  body.createdAt = existing.createdAt
  body.updatedAt = new Date().toISOString()
  await writeBoard(body)
  return body
})
