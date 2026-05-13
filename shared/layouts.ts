import type { WidgetKindId } from './widget-kind-styles'

export type DisplayStyleId = string

export interface LayoutDefinition {
  label: string
  description?: string
  icon: string
  defaultDisplayStyle: Partial<Record<WidgetKindId, DisplayStyleId>>
  tokens: Record<string, string>
}

export const LAYOUTS = {
  default: {
    label: 'Default',
    description: 'Spacious cards in a responsive grid.',
    icon: 'i-lucide-layout-grid',
    defaultDisplayStyle: {},
    tokens: {}
  }
} as const satisfies Record<string, LayoutDefinition>

export type LayoutId = keyof typeof LAYOUTS

export const DEFAULT_LAYOUT_ID: LayoutId = 'default'

export function resolveLayoutId(value: string | undefined): LayoutId {
  return value && value in LAYOUTS ? value as LayoutId : DEFAULT_LAYOUT_ID
}
