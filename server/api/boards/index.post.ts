import type { Board } from '~~/shared/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<Board>(event)

  if (!body.id || !VALID_BOARD_ID.test(body.id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid board ID' })
  }
  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Board must have a title' })
  }

  const storage = useStorage('boards')

  const existing = await storage.getItem<Board>(body.id)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Board already exists' })
  }

  const now = new Date().toISOString()
  body.createdAt = now
  body.updatedAt = now

  await storage.setItem(body.id, body)
  return body
})
