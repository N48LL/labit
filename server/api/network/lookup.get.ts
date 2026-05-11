import ipaddr from 'ipaddr.js'
import type { NetworkInfoSuccess, NetworkInfoResponse } from '~~/shared/types'

interface IpApiResponse {
  status: 'success' | 'fail'
  message?: string
  query?: string
  country?: string
  countryCode?: string
  region?: string
  regionName?: string
  city?: string
  isp?: string
  org?: string
  as?: string
  mobile?: boolean
  proxy?: boolean
  hosting?: boolean
}

const IP_API_BASE = 'http://ip-api.com/json'
const IP_API_FIELDS = 'status,message,query,country,countryCode,region,regionName,city,isp,org,as'

const SERVER_TTL_MS = 60 * 60 * 1000
const CLIENT_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  data: NetworkInfoSuccess
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry>()

function pruneCache() {
  if (memoryCache.size <= 200) return
  const now = Date.now()
  for (const [key, entry] of memoryCache) {
    if (entry.expiresAt <= now) memoryCache.delete(key)
  }
}

function isPrivateIp(ip: string): boolean {
  try {
    let addr = ipaddr.parse(ip)
    if (addr.kind() === 'ipv6' && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
      addr = (addr as ipaddr.IPv6).toIPv4Address()
    }
    return addr.range() !== 'unicast'
  } catch {
    return false
  }
}

function asnFromIpApi(raw: string | undefined): string {
  if (!raw) return ''
  const firstToken = raw.split(' ')[0]
  return firstToken ?? ''
}

async function lookupViaIpApi(ip: string | null): Promise<NetworkInfoSuccess> {
  const url = ip
    ? `${IP_API_BASE}/${encodeURIComponent(ip)}?fields=${IP_API_FIELDS}`
    : `${IP_API_BASE}/?fields=${IP_API_FIELDS}`

  const response = await $fetch<IpApiResponse>(url, { timeout: 10_000 })

  if (response.status !== 'success') {
    throw new Error(response.message || 'ip-api returned failure')
  }

  return {
    ip: response.query ?? ip ?? '',
    countryCode: response.countryCode ?? '',
    country: response.country ?? '',
    region: response.regionName ?? response.region ?? '',
    city: response.city ?? '',
    isp: response.isp ?? '',
    org: response.org ?? '',
    asn: asnFromIpApi(response.as),
    cached: false,
    fetchedAt: new Date().toISOString()
  }
}

export default defineEventHandler(async (event): Promise<NetworkInfoResponse> => {
  const query = getQuery(event)
  const mode = query.mode === 'client' ? 'client' : 'server'

  if (mode === 'server') {
    const cached = memoryCache.get('server')
    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.data, cached: true }
    }

    try {
      const data = await lookupViaIpApi(null)
      memoryCache.set('server', { data, expiresAt: Date.now() + SERVER_TTL_MS })
      return data
    } catch (error) {
      return { error: 'unavailable', reason: (error as Error).message }
    }
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true })

  if (!clientIp) {
    return { error: 'unavailable', reason: 'Could not determine client IP' }
  }

  if (isPrivateIp(clientIp)) {
    return {
      ip: clientIp,
      lan: true,
      cached: false,
      fetchedAt: new Date().toISOString()
    }
  }

  const cacheKey = `client:${clientIp}`
  const cached = memoryCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached.data, cached: true }
  }

  try {
    const data = await lookupViaIpApi(clientIp)
    pruneCache()
    memoryCache.set(cacheKey, { data, expiresAt: Date.now() + CLIENT_TTL_MS })
    return data
  } catch (error) {
    return { error: 'unavailable', reason: (error as Error).message }
  }
})
