export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !VALID_BOARD_ID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid board ID' })
  }

  const board = await readBoard(id)
  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  return board
})
