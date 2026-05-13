import type { BoardLayoutId } from '~~/shared/types'
import { defineAsyncComponent } from 'vue'

export interface LayoutRespects {
  sectionColumns: boolean
  sectionColumnsCaption?: string
  widgetSpan: boolean
  widgetSpanCaption?: string
  sectionTitle: boolean
  sectionTitleCaption?: string
  sectionCollapsible: boolean
  sectionCollapsibleCaption?: string
}

export interface LayoutDefinition {
  id: BoardLayoutId
  label: string
  description: string
  icon: string
  respects: LayoutRespects
}

const layoutDefinitions: LayoutDefinition[] = [
  {
    id: 'hub',
    label: 'Hub',
    description: '3-column widget grid. Accent on top of each card. Calm.',
    icon: 'i-lucide-layout-grid',
    respects: {
      sectionColumns: true,
      widgetSpan: true,
      sectionTitle: true,
      sectionCollapsible: true
    }
  },
  {
    id: 'rack',
    label: 'Rack',
    description: 'Dense 4-column grid. Color stripe left. Live-stats strip.',
    icon: 'i-lucide-server',
    respects: {
      sectionColumns: false,
      sectionColumnsCaption: 'Rack layout uses a fixed 4-column grid.',
      widgetSpan: false,
      widgetSpanCaption: 'Rack layout uses a fixed 4-column grid; widgets do not span columns.',
      sectionTitle: true,
      sectionCollapsible: true
    }
  },
  {
    id: 'operator',
    label: 'Operator',
    description: 'Sidebar + table view. Best for many services.',
    icon: 'i-lucide-table-2',
    respects: {
      sectionColumns: false,
      sectionColumnsCaption: 'Operator layout renders services as a table; column count does not apply.',
      widgetSpan: false,
      widgetSpanCaption: 'Operator layout renders services as a table; widget span does not apply.',
      sectionTitle: true,
      sectionCollapsible: true
    }
  }
]

const layoutComponents: Record<BoardLayoutId, ReturnType<typeof defineAsyncComponent>> = {
  hub: defineAsyncComponent(() => import('~/components/board/layouts/HubLayout.vue')),
  rack: defineAsyncComponent(() => import('~/components/board/layouts/RackLayout.vue')),
  operator: defineAsyncComponent(() => import('~/components/board/layouts/OperatorLayout.vue'))
}

const DEFAULT_LAYOUT: BoardLayoutId = 'hub'

export function useLayoutRegistry() {
  function getDefinition(id: BoardLayoutId | undefined): LayoutDefinition | undefined {
    if (!id) return undefined
    return layoutDefinitions.find(d => d.id === id)
  }

  function getComponent(id: BoardLayoutId | undefined) {
    return layoutComponents[id ?? DEFAULT_LAYOUT]
  }

  function getAll(): LayoutDefinition[] {
    return layoutDefinitions
  }

  function getDefault(): BoardLayoutId {
    return DEFAULT_LAYOUT
  }

  return {
    getDefinition,
    getComponent,
    getAll,
    getDefault
  }
}
