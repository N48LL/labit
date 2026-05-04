import { writeFile, readdir, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { Buffer } from 'node:buffer'

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  await mkdir(ICONS_DIR, { recursive: true })

  const existing = await readdir(ICONS_DIR)
  if (existing.length >= MAX_ICON_COUNT) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_ICON_COUNT} custom icons allowed` })
  }

  const file = formData[0]
  if (!file || !file.filename || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file' })
  }

  if (file.data.length > MAX_ICON_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'File too large (max 512KB)' })
  }

  const ext = extname(file.filename).toLowerCase()
  if (!ALLOWED_ICON_EXT.includes(ext)) {
    throw createError({ statusCode: 400, statusMessage: `File type not allowed. Use: ${ALLOWED_ICON_EXT.join(', ')}` })
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Content type not allowed' })
  } else if (!file.type && ext !== '.svg') {
    throw createError({ statusCode: 400, statusMessage: 'Content type header required' })
  }

  const safeName = sanitizeIconFilename(file.filename)
  if (!safeName) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  if (existing.includes(safeName)) {
    throw createError({ statusCode: 409, statusMessage: 'An icon with this name already exists' })
  }

  let data = file.data
  if (ext === '.svg') {
    const content = data.toString('utf-8')
    if (!isValidSvg(content)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid SVG file' })
    }
    data = Buffer.from(sanitizeSvg(content), 'utf-8')
  }

  await writeFile(join(ICONS_DIR, safeName), data)

  setResponseStatus(event, 201)
  return { filename: safeName, url: `/api/icons/custom/file/${safeName}` }
})
