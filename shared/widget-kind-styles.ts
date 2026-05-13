import type { DisplayStyleId } from './layouts'

export const WIDGET_KIND_STYLES = {
  'service-link': ['full'],
  'clock': ['full'],
  'notes': ['full'],
  'network-info': ['full']
} as const satisfies Record<string, readonly DisplayStyleId[]>

export type WidgetKindId = keyof typeof WIDGET_KIND_STYLES
