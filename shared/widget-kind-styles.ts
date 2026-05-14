import type { DisplayStyleId } from './layouts'

export const WIDGET_KIND_STYLES = {
  'service-link': ['full', 'rack'],
  'clock': ['full', 'header'],
  'notes': ['full'],
  'network-info': ['full', 'header']
} as const satisfies Record<string, readonly DisplayStyleId[]>

export type WidgetKindId = keyof typeof WIDGET_KIND_STYLES
