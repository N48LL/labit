export const HEADER_ITEM_TYPES = ['brand', 'edit-theme-actions', 'clock', 'network-info'] as const
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

export function isHeaderItemType(value: unknown): value is HeaderItemType {
  return typeof value === 'string' && (HEADER_ITEM_TYPES as readonly string[]).includes(value)
}
