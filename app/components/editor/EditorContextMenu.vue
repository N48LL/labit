<script setup lang="ts">
import type { WidgetInstance, BoardSection } from '~~/shared/types'

const props = defineProps<{
  widget: WidgetInstance
  section: BoardSection
  disabled?: boolean
}>()

const store = useBoardStore()
const { markDirty } = useEditMode()

const showSettings = ref(false)
const menuOpen = ref(false)

const items = computed(() => {
  if (props.disabled) return []

  const board = store.board
  if (!board) return []

  const maxSpan = Math.min(props.section.columns, 6)
  const spanChildren = Array.from({ length: maxSpan }, (_, i) => ({
    label: `${i + 1} column${i > 0 ? 's' : ''}`,
    icon: props.widget.span === i + 1 ? 'i-lucide-check' : undefined,
    onSelect() {
      store.updateWidgetSpan(props.section.id, props.widget.id, i + 1)
      markDirty()
    }
  }))

  const { getPluginsFor } = usePluginRegistry()
  const availablePlugins = getPluginsFor(props.widget.kind)
  const pluginChildren = availablePlugins.map(plugin => ({
    label: plugin.label,
    icon: plugin.icon,
    type: 'checkbox' as const,
    checked: props.widget.plugins?.[plugin.id]?.enabled
      ?? props.section.defaults?.plugins?.[plugin.id]?.enabled
      ?? false,
    onUpdateChecked(checked: boolean) {
      store.updateWidgetPlugins(props.section.id, props.widget.id, {
        [plugin.id]: { enabled: checked }
      })
      markDirty()
    }
  }))

  const otherSections = board.sections.filter(s => s.id !== props.section.id)
  const moveChildren = otherSections.map(s => ({
    label: s.title,
    onSelect() {
      store.moveWidgetToSection(props.section.id, props.widget.id, s.id)
      markDirty()
    }
  }))

  const groups: Record<string, unknown>[][] = [
    [
      {
        label: 'Edit Settings',
        icon: 'i-lucide-pencil',
        onSelect() {
          showSettings.value = true
        }
      },
      {
        label: 'Duplicate',
        icon: 'i-lucide-copy',
        onSelect() {
          store.duplicateWidget(props.section.id, props.widget.id)
          markDirty()
        }
      }
    ],
    [
      {
        label: 'Span',
        icon: 'i-lucide-columns-2',
        children: spanChildren
      }
    ]
  ]

  if (pluginChildren.length > 0) {
    groups.push([{
      label: 'Plugins',
      icon: 'i-lucide-plug',
      children: pluginChildren
    }])
  }

  if (moveChildren.length > 0) {
    groups.push([{
      label: 'Move to',
      icon: 'i-lucide-move',
      children: moveChildren
    }])
  }

  groups.push([{
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    color: 'error',
    onSelect() {
      store.removeWidget(props.section.id, props.widget.id)
      markDirty()
    }
  }])

  return groups
})
</script>

<template>
  <div class="relative">
    <slot />

    <div
      v-if="!disabled"
      class="no-drag absolute top-1.5 right-1.5 z-10"
    >
      <UDropdownMenu
        v-model:open="menuOpen"
        :items="items"
        :content="{ align: 'end' }"
      >
        <UButton
          icon="i-lucide-ellipsis-vertical"
          size="md"
          variant="ghost"
          color="neutral"
          class="rounded-full"
        />
      </UDropdownMenu>
    </div>

    <EditorWidgetSettings
      v-model:open="showSettings"
      :widget="widget"
      :section="section"
    />
  </div>
</template>
