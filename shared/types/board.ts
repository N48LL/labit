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

export interface BoardSection {
  id: string
  title: string
  layout: 'grid' | 'masonry'
  columns: number
  collapsible: boolean
  collapsed: boolean
  showTitle: boolean
  widgets: import('./widget').WidgetInstance[]
  defaults: {
    cardVariant?: 'outline' | 'accent' | 'soft' | 'subtle' | 'ghost'
    cardColor?: string
    plugins?: Record<string, {
      enabled?: boolean
      position?: import('./plugin').PluginPosition
      config?: Record<string, unknown>
    }>
  }
}

export interface Board {
  id: string
  title: string
  slug: string
  settings: BoardSettings
  sections: BoardSection[]
  labels: LabelDefinition[]
  createdAt: string
  updatedAt: string
}
