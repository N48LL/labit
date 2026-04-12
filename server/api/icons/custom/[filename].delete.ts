import { unlink, access } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  if (!filename || !SAFE_ICON_FILENAME.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  const filePath = join(ICONS_DIR, filename)

  try {
    await access(filePath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Icon not found' })
  }

  await unlink(filePath)
  return { success: true }
})
