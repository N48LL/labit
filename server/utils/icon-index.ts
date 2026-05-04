import lucideData from '@iconify-json/lucide/icons.json'
import simpleIconsData from '@iconify-json/simple-icons/icons.json'

interface IconCollection {
  id: string
  name: string
  prefix: string
  iconNames: string[]
}

const collections: IconCollection[] = [
  {
    id: 'lucide',
    name: 'Lucide',
    prefix: lucideData.prefix,
    iconNames: Object.keys(lucideData.icons)
  },
  {
    id: 'simple-icons',
    name: 'Simple Icons',
    prefix: simpleIconsData.prefix,
    iconNames: Object.keys(simpleIconsData.icons)
  }
]

export function getCollections(): IconCollection[] {
  return collections
}

export function searchIcons(query: string, collectionId?: string, limit = 50, offset = 0): { icons: string[], total: number } {
  const cols = getCollections()
  const targets = collectionId
    ? cols.filter(c => c.id === collectionId)
    : cols

  const lowerQuery = query.toLowerCase()
  const matched: string[] = []

  for (const col of targets) {
    for (const name of col.iconNames) {
      if (name.toLowerCase().includes(lowerQuery)) {
        matched.push(`${col.prefix}:${name}`)
      }
    }
  }

  return {
    icons: matched.slice(offset, offset + limit),
    total: matched.length
  }
}

export function browseIcons(collectionId: string, limit = 50, offset = 0): { icons: string[], total: number } {
  const cols = getCollections()
  const col = cols.find(c => c.id === collectionId)
  if (!col) return { icons: [], total: 0 }

  const all = col.iconNames.map(name => `${col.prefix}:${name}`)
  return {
    icons: all.slice(offset, offset + limit),
    total: all.length
  }
}
