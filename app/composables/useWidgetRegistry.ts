import type { WidgetDefinition, WidgetKind, DisplayStyleId } from '~~/shared/types'
import { defineAsyncComponent, type Component } from 'vue'

interface DisplayStyleEntry {
  label: string
  component: Component
  absorbsPlugins?: readonly string[]
}

interface KindRecord {
  definition: WidgetDefinition
  displayStyles: Record<DisplayStyleId, DisplayStyleEntry>
}

const kinds: Record<WidgetKind, KindRecord> = {
  'service-link': {
    definition: {
      kind: 'service-link',
      label: 'Service Link',
      icon: 'i-lucide-external-link',
      description: 'Bookmark to a self-hosted service with icon and status',
      defaultOptions: {
        title: 'Service',
        description: '',
        url: 'http://localhost',
        icon: 'i-lucide-server',
        iconType: 'iconify',
        iconBackground: false,
        openInNewTab: true,
        labels: []
      },
      defaultDisplayStyle: 'full'
    },
    displayStyles: {
      full: {
        label: 'Full',
        component: defineAsyncComponent(() => import('~/components/widgets/ServiceLink.vue'))
      },
      rack: {
        label: 'Rack',
        component: defineAsyncComponent(() => import('~/components/widgets/ServiceLinkRack.vue')),
        absorbsPlugins: ['health-check']
      }
    }
  },
  'clock': {
    definition: {
      kind: 'clock',
      label: 'Clock',
      icon: 'i-lucide-clock',
      description: 'Shows current date and time',
      defaultOptions: { format24h: true, showSeconds: false, showDate: true, size: 'md' },
      defaultDisplayStyle: 'full'
    },
    displayStyles: {
      full: {
        label: 'Full',
        component: defineAsyncComponent(() => import('~/components/widgets/ClockWidget.vue'))
      },
      header: {
        label: 'Header',
        component: defineAsyncComponent(() => import('~/components/widgets/ClockHeader.vue'))
      }
    }
  },
  'notes': {
    definition: {
      kind: 'notes',
      label: 'Notes',
      icon: 'i-lucide-sticky-note',
      description: 'Text or markdown notes',
      defaultOptions: { content: '' },
      defaultDisplayStyle: 'full'
    },
    displayStyles: {
      full: {
        label: 'Full',
        component: defineAsyncComponent(() => import('~/components/widgets/NotesWidget.vue'))
      }
    }
  },
  'network-info': {
    definition: {
      kind: 'network-info',
      label: 'Network Info',
      icon: 'i-lucide-globe',
      description: 'Public IP and location for the homelab or viewer',
      defaultOptions: {
        title: '', mode: 'server', showFlag: true, flagStyle: 'circle',
        showIp: true, showCityCountry: true, showIsp: false, showAsn: false,
        size: 'md', refreshIntervalMs: 3_600_000
      },
      defaultDisplayStyle: 'full'
    },
    displayStyles: {
      full: {
        label: 'Full',
        component: defineAsyncComponent(() => import('~/components/widgets/NetworkInfoWidget.vue'))
      },
      header: {
        label: 'Header',
        component: defineAsyncComponent(() => import('~/components/widgets/NetworkInfoHeader.vue'))
      }
    }
  }
}

export interface DisplayStyleOption {
  id: DisplayStyleId
  label: string
}

export function useWidgetRegistry() {
  function getDefinition(kind: WidgetKind): WidgetDefinition | undefined {
    return kinds[kind]?.definition
  }

  function getComponentForStyle(kind: WidgetKind, displayStyle: DisplayStyleId): Component | undefined {
    return kinds[kind]?.displayStyles[displayStyle]?.component
  }

  function getDisplayStyleOptions(kind: WidgetKind): DisplayStyleOption[] {
    const styles = kinds[kind]?.displayStyles ?? {}
    return Object.entries(styles).map(([id, entry]) => ({ id, label: entry.label }))
  }

  function getAbsorbedPlugins(kind: WidgetKind, displayStyle: DisplayStyleId): readonly string[] {
    return kinds[kind]?.displayStyles[displayStyle]?.absorbsPlugins ?? []
  }

  function getAllDefinitions(): WidgetDefinition[] {
    return Object.values(kinds).map(k => k.definition)
  }

  return {
    getDefinition,
    getComponentForStyle,
    getDisplayStyleOptions,
    getAbsorbedPlugins,
    getAllDefinitions
  }
}
