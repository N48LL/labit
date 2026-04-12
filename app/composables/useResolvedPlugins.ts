import type { BoardSection, WidgetInstance, PluginConfig, PluginPosition } from '~~/shared/types'

interface ResolvedPlugin {
  id: string
  enabled: boolean
  position: PluginPosition
  config: Record<string, unknown>
}

export function useResolvedPlugins(section: BoardSection, widget: WidgetInstance): ResolvedPlugin[] {
  const { getAllPlugins } = usePluginRegistry()
  const allPlugins = getAllPlugins()
  const resolved: ResolvedPlugin[] = []

  for (const plugin of allPlugins) {
    if (plugin.compatibleWith !== '*' && !plugin.compatibleWith.includes(widget.kind)) {
      continue
    }

    const sectionDefault: Partial<PluginConfig> = section.defaults?.plugins?.[plugin.id] || {}

    const widgetOverride: Partial<PluginConfig> = widget.plugins?.[plugin.id] || {}

    const enabled = widgetOverride.enabled ?? sectionDefault.enabled ?? false
    const position = widgetOverride.position ?? sectionDefault.position ?? plugin.defaultPosition
    const config = {
      ...plugin.defaultConfig,
      ...(sectionDefault.config || {}),
      ...(widgetOverride.config || {})
    }

    if (enabled) {
      resolved.push({ id: plugin.id, enabled, position, config })
    }
  }

  return resolved
}
