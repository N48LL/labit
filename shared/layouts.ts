import type { WidgetKindId } from './widget-kind-styles'
import type { HeaderConfig } from './header-items'

export type DisplayStyleId = string

export interface LayoutDefinition {
  label: string
  description?: string
  icon: string
  defaultDisplayStyle: Partial<Record<WidgetKindId, DisplayStyleId>>
  tokens: Record<string, string>
  defaultHeader: HeaderConfig
}

export const LAYOUTS = {
  default: {
    label: 'Default',
    description: 'Spacious cards in a responsive grid.',
    icon: 'i-lucide-layout-grid',
    defaultDisplayStyle: {},
    tokens: {},
    defaultHeader: {
      left: [{ id: 'h-brand', type: 'brand' }],
      center: [],
      right: [{ id: 'h-actions', type: 'edit-theme-actions' }]
    }
  },
  rack: {
    label: 'Rack',
    description: 'Dense, sharp-edged grid for service-heavy boards.',
    icon: 'i-lucide-server',
    defaultDisplayStyle: { 'service-link': 'rack' },
    tokens: {},
    defaultHeader: {
      left: [{ id: 'h-brand', type: 'brand' }],
      center: [{ id: 'h-clock', type: 'clock', options: { format24h: true, showSeconds: false, showDate: false } }],
      right: [{ id: 'h-actions', type: 'edit-theme-actions' }]
    }
  }
} as const satisfies Record<string, LayoutDefinition>

export type LayoutId = keyof typeof LAYOUTS

export const DEFAULT_LAYOUT_ID: LayoutId = 'default'

export function resolveLayoutId(value: string | undefined): LayoutId {
  return value && value in LAYOUTS ? value as LayoutId : DEFAULT_LAYOUT_ID
}
