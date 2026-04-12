import type { PluginPosition } from './plugin'

export type WidgetKind = 'service-link' | 'clock' | 'notes'

export interface WidgetInstance {
  id: string
  kind: WidgetKind
  span: number
  options: Record<string, unknown>
  plugins: Record<string, {
    enabled: boolean
    position?: PluginPosition
    config?: Record<string, unknown>
  }>
}

export interface ServiceLinkOptions {
  title: string
  description?: string
  url: string
  icon: string
  iconType: 'iconify' | 'url' | 'custom'
  iconBackground: boolean
  openInNewTab: boolean
  labels: string[]
}

export interface ClockOptions {
  format24h: boolean
  showSeconds: boolean
  showDate: boolean
  timezone?: string
}

export interface NotesOptions {
  content: string
}

export interface WidgetDefinition {
  kind: WidgetKind
  label: string
  icon: string
  description: string
  defaultOptions: Record<string, unknown>
  minSpan?: number
  maxSpan?: number
}
