export default defineEventHandler(async () => {
  const boards = await listBoards()
  return boards.sort((a, b) => a.title.localeCompare(b.title))
})
