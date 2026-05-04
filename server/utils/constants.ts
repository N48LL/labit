import { join, extname } from 'node:path'

export const VALID_BOARD_ID = /^[a-z0-9][a-z0-9_-]*$/
export const BOARDS_DIR = join(process.cwd(), 'data', 'boards')
export const ICONS_DIR = join(process.cwd(), 'data', 'icons')
export const SAFE_ICON_FILENAME = /^[a-z0-9][a-z0-9_-]*\.[a-z]+$/
export const ALLOWED_ICON_EXT = ['.svg', '.png', '.jpg', '.jpeg', '.webp']
export const MAX_ICON_SIZE = 512 * 1024
export const MAX_ICON_COUNT = 200

export function sanitizeIconFilename(raw: string): string {
  const ext = extname(raw).toLowerCase()
  const base = raw
    .slice(0, -ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base ? `${base}${ext}` : ''
}
