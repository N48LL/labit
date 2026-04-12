export default defineEventHandler((event) => {
  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const collection = typeof query.collection === 'string' ? query.collection : undefined
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  if (collection && !['lucide', 'simple-icons'].includes(collection)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid collection' })
  }

  if (!q) {
    if (!collection) {
      throw createError({ statusCode: 400, statusMessage: 'Collection required when browsing without search query' })
    }
    return browseIcons(collection, limit, offset)
  }

  if (q.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Search query must be at least 2 characters' })
  }

  if (q.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Search query too long' })
  }

  return searchIcons(q, collection, limit, offset)
})
