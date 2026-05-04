export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw createError({ statusCode: 400, statusMessage: 'Only HTTP/HTTPS URLs are supported' })
  }

  const start = Date.now()

  try {
    const response = await $fetch.raw(url, {
      method: 'GET',
      timeout: 10_000,
      redirect: 'follow',
      ignoreResponseError: true
    })

    return {
      status: response.status,
      latency: Date.now() - start,
      online: response.status >= 200 && response.status < 400
    }
  } catch {
    return {
      status: 0,
      latency: Date.now() - start,
      online: false
    }
  }
})
