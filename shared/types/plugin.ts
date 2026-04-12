import type { WidgetKind } from './widget'
import type { Component } from 'vue'

export type PluginPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'footer'

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

export interface PluginConfig {
  enabled: boolean
  position?: PluginPosition
  config?: Record<string, unknown>
}
