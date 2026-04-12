const ALLOWED_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline',
  'polygon', 'text', 'tspan', 'textpath', 'defs', 'clippath', 'mask',
  'lineargradient', 'radialgradient', 'stop', 'symbol', 'title', 'desc',
  'metadata', 'image', 'pattern', 'marker', 'filter',
  'fegaussianblur', 'feoffset', 'feblend', 'fecolormatrix',
  'fecomponenttransfer', 'fecomposite', 'feconvolvematrix',
  'fediffuselighting', 'fedisplacementmap', 'feflood', 'feimage',
  'femerge', 'femergenode', 'femorphology', 'fespecularlighting',
  'fetile', 'feturbulence', 'fefunca', 'fefuncb', 'fefuncg', 'fefuncr'
])

const DANGEROUS_ATTR_PREFIXES = ['on']
const DANGEROUS_ATTR_VALUES = /^\s*(javascript|data\s*:text\/html)/i

export function sanitizeSvg(content: string): string {
  return content
    .replace(/<([a-z][a-z0-9-]*)((?:\s+[^>]*?)?)(\s*\/?>)/gi, (match, tag, attrs, close) => {
      const tagLower = tag.toLowerCase()
      if (!ALLOWED_TAGS.has(tagLower)) return ''

      const cleanAttrs = (attrs as string).replace(
        /\s+([a-z][a-z0-9-:]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi,
        (_attrMatch: string, name: string, dblVal: string, sglVal: string, unqVal: string) => {
          const attrName = name.toLowerCase()
          if (DANGEROUS_ATTR_PREFIXES.some(p => attrName.startsWith(p))) return ''
          const value = dblVal ?? sglVal ?? unqVal ?? ''
          if (DANGEROUS_ATTR_VALUES.test(value)) return ''
          return ` ${name}="${value.replace(/"/g, '&quot;')}"`
        }
      )

      return `<${tag}${cleanAttrs}${close}`
    })
    .replace(/<\/([a-z][a-z0-9-]*)\s*>/gi, (_match, tag) => {
      return ALLOWED_TAGS.has(tag.toLowerCase()) ? `</${tag}>` : ''
    })
}

export function isValidSvg(content: string): boolean {
  const trimmed = content.trim()
  return trimmed.startsWith('<svg') || (trimmed.startsWith('<?xml') && trimmed.includes('<svg'))
}
