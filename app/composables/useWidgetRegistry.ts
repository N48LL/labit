import type { WidgetDefinition, WidgetKind } from '~~/shared/types'
import { defineAsyncComponent } from 'vue'

const widgetDefinitions: WidgetDefinition[] = [
  {
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
    }
  },
  {
    kind: 'clock',
    label: 'Clock',
    icon: 'i-lucide-clock',
    description: 'Shows current date and time',
    defaultOptions: {
      format24h: false,
      showSeconds: true,
      showDate: true
    }
  },
  {
    kind: 'notes',
    label: 'Notes',
    icon: 'i-lucide-sticky-note',
    description: 'Text or markdown notes',
    defaultOptions: {
      content: ''
    }
  }
]

const widgetComponents: Partial<Record<WidgetKind, ReturnType<typeof defineAsyncComponent>>> = {
  'service-link': defineAsyncComponent(() => import('~/components/widgets/ServiceLink.vue')),
  'clock': defineAsyncComponent(() => import('~/components/widgets/ClockWidget.vue')),
  'notes': defineAsyncComponent(() => import('~/components/widgets/NotesWidget.vue'))
}

export function useWidgetRegistry() {
  function getDefinition(kind: WidgetKind): WidgetDefinition | undefined {
    return widgetDefinitions.find(d => d.kind === kind)
  }

  function getComponent(kind: WidgetKind) {
    return widgetComponents[kind]
  }

  function getAllDefinitions(): WidgetDefinition[] {
    return widgetDefinitions
  }

  return {
    getDefinition,
    getComponent,
    getAllDefinitions
  }
}
