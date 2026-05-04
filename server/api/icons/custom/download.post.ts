import { writeFile, readdir, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { Buffer } from 'node:buffer'
import { isIP } from 'node:net'
import { lookup } from 'node:dns/promises'
import ipaddr from 'ipaddr.js'

const MAX_REDIRECTS = 3
const FETCH_TIMEOUT_MS = 10000

const MIME_TO_EXT: Record<string, string> = {
  'image/svg+xml': '.svg',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp'
}

const BLOCKED_RANGES = new Set([
  'private',
  'loopback',
  'linkLocal',
  'uniqueLocal',
  'multicast',
  'unspecified',
  'reserved',
  'carrierGradeNat',
  'broadcast'
])

function isPrivateIP(ip: string): boolean {
  let parsed
  try {
    parsed = ipaddr.parse(ip)
  } catch {
    return true
  }

  if (parsed.kind() === 'ipv6' && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
    parsed = (parsed as ipaddr.IPv6).toIPv4Address()
  }

  const range = parsed.range()
  return BLOCKED_RANGES.has(range)
}

async function assertSafeHost(host: string): Promise<void> {
  let address = host
  if (!isIP(host)) {
    try {
      const resolved = await lookup(host)
      address = resolved.address
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Could not resolve hostname' })
    }
  }
  if (isPrivateIP(address)) {
    throw createError({ statusCode: 400, statusMessage: 'Requests to private/internal addresses are not allowed' })
  }
}

async function fetchWithSafeRedirects(initialUrl: string): Promise<Response> {
  let currentUrl = initialUrl

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = new URL(currentUrl)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw createError({ statusCode: 400, statusMessage: 'Only HTTP/HTTPS URLs are supported' })
    }
    await assertSafeHost(parsed.hostname)

    let response: Response
    try {
      response = await fetch(currentUrl, {
        headers: { 'User-Agent': 'Labbit/1.0' },
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      })
    } catch {
      throw createError({ statusCode: 502, statusMessage: 'Failed to fetch icon from URL' })
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) {
        throw createError({ statusCode: 502, statusMessage: 'Redirect with no Location header' })
      }
      if (hop === MAX_REDIRECTS) {
        throw createError({ statusCode: 502, statusMessage: 'Too many redirects' })
      }
      currentUrl = new URL(location, currentUrl).toString()
      continue
    }

    return response
  }

  throw createError({ statusCode: 502, statusMessage: 'Too many redirects' })
}

function filenameFromUrl(url: string, contentType: string): string {
  const pathname = new URL(url).pathname
  const basename = pathname.split('/').pop() || 'icon'
  const ext = extname(basename).toLowerCase()

  if (ext && ALLOWED_ICON_EXT.includes(ext)) {
    return sanitizeIconFilename(basename)
  }

  const mappedExt = MIME_TO_EXT[contentType]
  if (mappedExt) {
    const nameWithoutExt = basename.replace(/\.[^.]+$/, '') || 'icon'
    return sanitizeIconFilename(`${nameWithoutExt}${mappedExt}`)
  }

  return ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url: string }>(event)

  if (!body.url || typeof body.url !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'URL is required' })
  }

  try {
    new URL(body.url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  await mkdir(ICONS_DIR, { recursive: true })

  const existing = await readdir(ICONS_DIR)
  if (existing.length >= MAX_ICON_COUNT) {
    throw createError({ statusCode: 400, statusMessage: `Maximum ${MAX_ICON_COUNT} custom icons allowed` })
  }

  const response = await fetchWithSafeRedirects(body.url)

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: `Remote server returned ${response.status}` })
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_ICON_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Remote icon exceeds 512KB limit' })
  }

  const contentType = (response.headers.get('content-type') || '').split(';')[0].trim()
  if (!Object.keys(MIME_TO_EXT).includes(contentType)) {
    throw createError({ statusCode: 400, statusMessage: `Unsupported content type: ${contentType}` })
  }

  const arrayBuffer = await response.arrayBuffer()
  let data = Buffer.from(arrayBuffer)

  if (data.length > MAX_ICON_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Downloaded icon exceeds 512KB limit' })
  }

  const safeName = filenameFromUrl(body.url, contentType)
  if (!safeName) {
    throw createError({ statusCode: 400, statusMessage: 'Could not determine a valid filename from URL' })
  }

  const ext = extname(safeName).toLowerCase()
  if (ext === '.svg') {
    const content = data.toString('utf-8')
    if (!isValidSvg(content)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid SVG file' })
    }
    data = Buffer.from(sanitizeSvg(content), 'utf-8')
  }

  let finalName = safeName
  if (existing.includes(finalName)) {
    const base = finalName.slice(0, -ext.length)
    let counter = 1
    while (existing.includes(`${base}-${counter}${ext}`)) counter++
    finalName = `${base}-${counter}${ext}`
  }

  try {
    await writeFile(join(ICONS_DIR, finalName), data, { flag: 'wx' })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      throw createError({ statusCode: 409, statusMessage: 'Icon file already exists' })
    }
    throw err
  }

  setResponseStatus(event, 201)
  return { filename: finalName, url: `/api/icons/custom/file/${finalName}` }
})
