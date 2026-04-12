import { readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'

const MIME_TYPES: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
}

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  if (!filename || !SAFE_ICON_FILENAME.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  const ext = extname(filename).toLowerCase()
  const mime = MIME_TYPES[ext]
  if (!mime) {
    throw createError({ statusCode: 400, statusMessage: 'Unsupported file type' })
  }

  const filePath = join(ICONS_DIR, filename)

  try {
    const data = await readFile(filePath)
    setResponseHeader(event, 'Content-Type', mime)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
    setResponseHeader(event, 'Content-Security-Policy', 'default-src \'none\'; style-src \'unsafe-inline\'')
    return data
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Icon not found' })
  }
})
