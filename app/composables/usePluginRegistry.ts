import type { WidgetPlugin, WidgetKind } from '~~/shared/types'

const plugins: WidgetPlugin[] = []

export function usePluginRegistry() {
  function register(plugin: WidgetPlugin) {
    if (!plugins.find(p => p.id === plugin.id)) {
      plugins.push(plugin)
    }
  }

  function getPlugin(id: string): WidgetPlugin | undefined {
    return plugins.find(p => p.id === id)
  }

  function getPluginsFor(kind: WidgetKind): WidgetPlugin[] {
    return plugins.filter(p => p.compatibleWith === '*' || p.compatibleWith.includes(kind))
  }

  function getAllPlugins(): WidgetPlugin[] {
    return [...plugins]
  }

  return {
    register,
    getPlugin,
    getPluginsFor,
    getAllPlugins
  }
}
