import type { Component } from 'vue'

export interface LabelDefinition {
  id: string
  name: string
  color: string
}

export interface BoardSettings {
  background: {
    type: 'none' | 'color' | 'gradient' | 'image'
    value: string
    opacity?: number
    blur?: number
  }
  theme: {
    primary: string
    neutral: string
  }
}

export type WidgetKind = 'service-link' | 'clock' | 'notes' | 'network-info'

export type PluginPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'footer'

export interface PluginConfig {
  enabled: boolean
  position?: PluginPosition
  config?: Record<string, unknown>
}

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

export interface BoardSection {
  id: string
  title: string
  layout: 'grid' | 'masonry'
  columns: number
  collapsible: boolean
  collapsed: boolean
  showTitle: boolean
  widgets: WidgetInstance[]
  defaults: {
    cardVariant?: 'outline' | 'accent' | 'subtle' | 'ghost'
    cardColor?: string
    plugins?: Record<string, {
      enabled?: boolean
      position?: PluginPosition
      config?: Record<string, unknown>
    }>
  }
}

export interface Board {
  id: string
  title: string
  slug: string
  icon?: string
  iconType?: 'iconify' | 'url' | 'custom'
  settings: BoardSettings
  sections: BoardSection[]
  labels: LabelDefinition[]
  createdAt: string
  updatedAt: string
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
  size?: 'sm' | 'md' | 'lg' | 'xl'
  timezone?: string
}

export interface NotesOptions {
  content: string
}

export type NetworkInfoFlagStyle = 'circle' | 'rectangular' | 'square'

export interface NetworkInfoOptions {
  title: string
  mode: 'server' | 'client'
  showFlag: boolean
  flagStyle: NetworkInfoFlagStyle
  showIp: boolean
  showCityCountry: boolean
  showIsp: boolean
  showAsn: boolean
  size?: 'sm' | 'md' | 'lg'
  refreshIntervalMs: number
}

export interface NetworkInfoSuccess {
  ip: string
  countryCode: string
  country: string
  region: string
  city: string
  isp: string
  org: string
  asn: string
  cached: boolean
  fetchedAt: string
  lan?: false
}

export interface NetworkInfoLan {
  ip: string
  lan: true
  cached: false
  fetchedAt: string
}

export interface NetworkInfoError {
  error: 'unavailable'
  reason: string
}

export type NetworkInfoResponse = NetworkInfoSuccess | NetworkInfoLan | NetworkInfoError

export interface WidgetDefinition {
  kind: WidgetKind
  label: string
  icon: string
  description: string
  defaultOptions: Record<string, unknown>
  minSpan?: number
  maxSpan?: number
}

export interface WidgetPlugin {
  id: string
  label: string
  icon: string
  defaultPosition: PluginPosition
  defaultConfig: Record<string, unknown>
  compatibleWith: WidgetKind[] | '*'
  component: Component
  settingsComponent?: Component
}
