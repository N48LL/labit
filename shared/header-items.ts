export const HEADER_ITEM_TYPES = ['brand', 'edit-theme-actions', 'clock', 'network-info', 'spacer'] as const
export type HeaderItemType = (typeof HEADER_ITEM_TYPES)[number]

export interface HeaderItem {
  id: string
  type: HeaderItemType
  options?: Record<string, unknown>
}

export interface HeaderConfig {
  left: HeaderItem[]
  center: HeaderItem[]
  right: HeaderItem[]
}

export function isHeaderItemRemovable(item: HeaderItem): boolean {
  return item.type !== 'edit-theme-actions'
}

export function cloneDefaultHeader(defaults: HeaderConfig, generateId: () => string): HeaderConfig {
  return {
    left: defaults.left.map(item => ({ ...item, id: generateId() })),
    center: defaults.center.map(item => ({ ...item, id: generateId() })),
    right: defaults.right.map(item => ({ ...item, id: generateId() }))
  }
}
