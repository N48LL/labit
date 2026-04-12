import { readdir } from 'node:fs/promises'

export default defineEventHandler(async () => {
  let files: string[]
  try {
    files = await readdir(ICONS_DIR)
  } catch {
    return { icons: [] }
  }
  const icons = files
    .filter(f => ALLOWED_ICON_EXT.some(ext => f.toLowerCase().endsWith(ext)))
    .map(filename => ({
      filename,
      url: `/api/icons/custom/file/${filename}`
    }))

  return { icons }
})
