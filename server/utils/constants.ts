import { join } from 'node:path'

export const VALID_BOARD_ID = /^[a-z0-9][a-z0-9_-]*$/
export const ICONS_DIR = join(process.cwd(), 'data', 'icons')
export const SAFE_ICON_FILENAME = /^[a-z0-9][a-z0-9_-]*\.[a-z]+$/
export const ALLOWED_ICON_EXT = ['.svg', '.png', '.jpg', '.jpeg', '.webp']
