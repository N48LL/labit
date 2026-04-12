import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

interface IconCollection {
  id: string
  name: string
  prefix: string
  iconNames: string[]
}

let collections: IconCollection[] | null = null

function loadCollections(): IconCollection[] {
  const require = createRequire(import.meta.url)

  const specs = [
    { id: 'lucide', name: 'Lucide', pkg: '@iconify-json/lucide/icons.json' },
    { id: 'simple-icons', name: 'Simple Icons', pkg: '@iconify-json/simple-icons/icons.json' }
  ]

  return specs.map((spec) => {
    const jsonPath = require.resolve(spec.pkg)
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
    const iconNames = Object.keys(data.icons)
    return {
      id: spec.id,
      name: spec.name,
      prefix: data.prefix,
      iconNames
    }
  })
}

export function getCollections(): IconCollection[] {
  if (!collections) {
    collections = loadCollections()
  }
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
