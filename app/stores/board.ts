import type { Board, BoardSection, WidgetInstance, WidgetKind, LabelDefinition, LayoutId, HeaderItem, HeaderConfig } from '~~/shared/types'
import { LAYOUTS } from '~~/shared/layouts'
import { generateId } from '~/utils/id'

export const useBoardStore = defineStore('board', () => {
  const board = ref<Board | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  async function load(id = 'default') {
    loading.value = true
    try {
      board.value = await $fetch<Board>(`/api/boards/${id}`)
    } finally {
      loading.value = false
    }
  }

  async function save() {
    if (!board.value) return
    saving.value = true
    try {
      board.value.updatedAt = new Date().toISOString()
      await $fetch(`/api/boards/${board.value.id}`, {
        method: 'PUT',
        body: board.value
      })
    } finally {
      saving.value = false
    }
  }

  function addSection(section?: Partial<BoardSection>) {
    if (!board.value) return
    const newSection: BoardSection = {
      title: section?.title || 'New Section',
      layout: section?.layout || 'grid',
      columns: section?.columns || 3,
      collapsible: section?.collapsible ?? true,
      collapsed: false,
      showTitle: section?.showTitle ?? true,
      widgets: [],
      defaults: {
        cardVariant: section?.defaults?.cardVariant || 'outline'
      },
      id: generateId()
    }
    board.value.sections.push(newSection)
    return newSection
  }

  function removeSection(sectionId: string) {
    if (!board.value) return
    board.value.sections = board.value.sections.filter(s => s.id !== sectionId)
  }

  function updateSection(sectionId: string, updates: Partial<BoardSection>) {
    if (!board.value) return
    const section = board.value.sections.find(s => s.id === sectionId)
    if (section) Object.assign(section, updates)
  }

  function setLayout(layout: LayoutId) {
    if (!board.value) return
    board.value.layout = layout
  }

  function ensureHeader(layoutId: LayoutId): HeaderConfig | null {
    if (!board.value) return null
    if (!board.value.headers) board.value.headers = {}
    if (!board.value.headers[layoutId]) {
      const defaults = LAYOUTS[layoutId].defaultHeader
      board.value.headers[layoutId] = {
        left: defaults.left.map(item => ({ ...item })),
        center: defaults.center.map(item => ({ ...item })),
        right: defaults.right.map(item => ({ ...item }))
      }
    }
    return board.value.headers[layoutId] ?? null
  }

  function setHeaderSlot(layoutId: LayoutId, slot: 'left' | 'center' | 'right', items: HeaderItem[]) {
    const header = ensureHeader(layoutId)
    if (!header) return
    header[slot] = items
  }

  function addHeaderItem(layoutId: LayoutId, slot: 'left' | 'center' | 'right', item: HeaderItem) {
    const header = ensureHeader(layoutId)
    if (!header) return
    header[slot].push(item)
  }

  function removeHeaderItem(layoutId: LayoutId, itemId: string) {
    const header = ensureHeader(layoutId)
    if (!header) return
    for (const slot of ['left', 'center', 'right'] as const) {
      header[slot] = header[slot].filter(i => i.id !== itemId)
    }
  }

  function updateHeaderItemOptions(layoutId: LayoutId, itemId: string, options: Record<string, unknown>) {
    const header = ensureHeader(layoutId)
    if (!header) return
    for (const slot of ['left', 'center', 'right'] as const) {
      const item = header[slot].find(i => i.id === itemId)
      if (item) {
        item.options = { ...(item.options || {}), ...options }
        return
      }
    }
  }

  function addWidget(sectionId: string, kind: WidgetKind, options: Record<string, unknown> = {}) {
    if (!board.value) return
    const section = board.value.sections.find(s => s.id === sectionId)
    if (!section) return

    const widget: WidgetInstance = {
      id: generateId(),
      kind,
      span: 1,
      options,
      plugins: {}
    }
    section.widgets.push(widget)
    return widget
  }

  function removeWidget(sectionId: string, widgetId: string) {
    if (!board.value) return
    const section = board.value.sections.find(s => s.id === sectionId)
    if (section) {
      section.widgets = section.widgets.filter(w => w.id !== widgetId)
    }
  }

  function updateWidgetOptions(sectionId: string, widgetId: string, options: Record<string, unknown>) {
    const widget = findWidget(sectionId, widgetId)
    if (widget) Object.assign(widget.options, options)
  }

  function updateWidgetPlugins(sectionId: string, widgetId: string, plugins: WidgetInstance['plugins']) {
    const widget = findWidget(sectionId, widgetId)
    if (widget) Object.assign(widget.plugins, plugins)
  }

  function updateWidgetSpan(sectionId: string, widgetId: string, span: number) {
    const widget = findWidget(sectionId, widgetId)
    if (widget) widget.span = span
  }

  function updateWidgetDisplayStyle(sectionId: string, widgetId: string, displayStyle: string | undefined) {
    const widget = findWidget(sectionId, widgetId)
    if (!widget) return
    if (displayStyle) {
      widget.displayStyle = displayStyle
    } else {
      delete widget.displayStyle
    }
  }

  function duplicateWidget(sectionId: string, widgetId: string) {
    if (!board.value) return
    const section = board.value.sections.find(s => s.id === sectionId)
    if (!section) return
    const widget = section.widgets.find(w => w.id === widgetId)
    if (!widget) return

    const copy: WidgetInstance = {
      ...JSON.parse(JSON.stringify(widget)),
      id: generateId()
    }
    const idx = section.widgets.indexOf(widget)
    section.widgets.splice(idx + 1, 0, copy)
    return copy
  }

  function moveWidgetToSection(fromSectionId: string, widgetId: string, toSectionId: string) {
    if (!board.value) return
    const fromSection = board.value.sections.find(s => s.id === fromSectionId)
    const toSection = board.value.sections.find(s => s.id === toSectionId)
    if (!fromSection || !toSection) return

    const widgetIdx = fromSection.widgets.findIndex(w => w.id === widgetId)
    if (widgetIdx === -1) return

    const widget = fromSection.widgets.splice(widgetIdx, 1)[0]
    if (widget) toSection.widgets.push(widget)
  }

  function findWidget(sectionId: string, widgetId: string): WidgetInstance | undefined {
    if (!board.value) return
    const section = board.value.sections.find(s => s.id === sectionId)
    return section?.widgets.find(w => w.id === widgetId)
  }

  function findSectionByWidgetId(widgetId: string): BoardSection | undefined {
    if (!board.value) return
    return board.value.sections.find(s => s.widgets.some(w => w.id === widgetId))
  }

  function addLabel(name: string, color: string): LabelDefinition | null {
    if (!board.value) return null
    if (!board.value.labels) board.value.labels = []
    if (board.value.labels.length >= 50) return null
    const duplicate = board.value.labels.find(
      l => l.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (duplicate) return null

    const label: LabelDefinition = {
      id: generateId(),
      name: name.trim().slice(0, 20),
      color
    }
    board.value.labels.push(label)
    return label
  }

  function removeLabel(labelId: string) {
    if (!board.value) return
    if (!board.value.labels) return
    board.value.labels = board.value.labels.filter(l => l.id !== labelId)
    for (const section of board.value.sections) {
      for (const widget of section.widgets) {
        const labels = widget.options.labels as string[] | undefined
        if (labels && Array.isArray(labels)) {
          widget.options.labels = labels.filter(id => id !== labelId)
        }
      }
    }
  }

  function updateLabel(labelId: string, updates: Partial<Omit<LabelDefinition, 'id'>>) {
    if (!board.value?.labels) return
    const label = board.value.labels.find(l => l.id === labelId)
    if (!label) return
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim().slice(0, 20)
      const duplicate = board.value.labels.find(
        l => l.id !== labelId && l.name.toLowerCase() === trimmed.toLowerCase()
      )
      if (duplicate) return
      label.name = trimmed
    }
    if (updates.color !== undefined) {
      label.color = updates.color
    }
  }

  function getLabel(labelId: string): LabelDefinition | undefined {
    return board.value?.labels?.find(l => l.id === labelId)
  }

  return {
    board,
    loading,
    saving,
    load,
    save,
    addSection,
    removeSection,
    updateSection,
    setLayout,
    setHeaderSlot,
    addHeaderItem,
    removeHeaderItem,
    updateHeaderItemOptions,
    addWidget,
    removeWidget,
    updateWidgetOptions,
    updateWidgetPlugins,
    updateWidgetSpan,
    updateWidgetDisplayStyle,
    duplicateWidget,
    moveWidgetToSection,
    findWidget,
    findSectionByWidgetId,
    addLabel,
    removeLabel,
    updateLabel,
    getLabel
  }
})
