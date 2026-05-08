const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  if (!config.public.readOnly) return
  if (!event.path.startsWith('/api/')) return
  if (SAFE_METHODS.has(event.method)) return

  throw createError({
    statusCode: 403,
    statusMessage: 'Read-only mode: write operations are disabled.'
  })
})
