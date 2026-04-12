import { writeFile, readdir, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { Buffer } from 'node:buffer'

const MAX_FILE_SIZE = 512 * 1024
const MAX_FILE_COUNT = 200
const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp']

function sanitizeFilename(raw: string): string {
  const ext = extname(raw).toLowerCase()
  const base = raw
    .slice(0, -ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base ? `${base}${ext}` : ''
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file provided' })
  }

  await mkdir(ICONS_DIR, { recursive: true })

  const existing = await readdir(ICONS_DIR)
  if (existing.length >= MAX_FILE_COUNT) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_FILE_COUNT} custom icons allowed` })
  }

  const file = formData[0]
  if (!file || !file.filename || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file' })
  }

  if (file.data.length > MAX_FILE_SIZE) {
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

  const safeName = sanitizeFilename(file.filename)
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
