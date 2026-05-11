import type { NetworkInfoFlagStyle } from '~~/shared/types'

export function flagIconName(code: string, style: NetworkInfoFlagStyle): string | null {
  if (!code) return null
  const lower = code.toLowerCase()
  switch (style) {
    case 'rectangular': return `i-flag-${lower}-4x3`
    case 'square': return `i-flag-${lower}-1x1`
    case 'circle':
    default: return `i-circle-flags-${lower}`
  }
}
