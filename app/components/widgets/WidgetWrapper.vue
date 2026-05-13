<script setup lang="ts">
import type { WidgetInstance, BoardSection } from '~~/shared/types'
import { LAYOUTS, resolveLayoutId, type LayoutDefinition } from '~~/shared/layouts'
import { WIDGET_KIND_STYLES } from '~~/shared/widget-kind-styles'
import { resolveDisplayStyle } from '~~/shared/resolve-display-style'

const props = defineProps<{
  widget: WidgetInstance
  section: BoardSection
}>()

const { isEditing } = useEditMode()

const isAccent = computed(() => props.section.defaults?.cardVariant === 'accent')
const isGhost = computed(() => props.section.defaults?.cardVariant === 'ghost')
const isLinkable = computed(() => props.widget.kind === 'service-link')

type UCardVariant = 'outline' | 'subtle' | 'soft' | 'solid'

const cardVariant = computed<UCardVariant>(() => {
  const variant = (props.section.defaults?.cardVariant || 'outline') as string
  if (variant === 'accent' || variant === 'ghost') return 'outline'
  if (variant === 'soft') return 'subtle'
  if (variant === 'subtle' || variant === 'solid') return variant
  return 'outline'
})

const cardColor = computed(() => {
  return props.section.defaults?.cardColor || undefined
})

const cardUi = computed(() => {
  const body = 'p-[var(--layout-card-padding)]'
  if (isGhost.value) {
    return { root: 'rounded-[var(--layout-card-radius)] bg-transparent ring-0 divide-y-0', body }
  }
  return { body }
})

const resolvedPlugins = computed(() => {
  return useResolvedPlugins(props.section, props.widget)
})

function pluginsAt(position: string) {
  return resolvedPlugins.value.filter(p => p.position === position)
}

const { getComponentForStyle, getDefinition } = useWidgetRegistry()
const store = useBoardStore()

const resolvedStyle = computed(() => {
  const activeLayout: LayoutDefinition = LAYOUTS[resolveLayoutId(store.board?.layout)]
  const kindDefault = getDefinition(props.widget.kind)?.defaultDisplayStyle ?? 'full'
  return resolveDisplayStyle(
    props.widget.displayStyle,
    activeLayout.defaultDisplayStyle[props.widget.kind],
    kindDefault,
    WIDGET_KIND_STYLES[props.widget.kind]
  )
})

const variantComponent = computed(() => getComponentForStyle(props.widget.kind, resolvedStyle.value))
</script>

<template>
  <EditorContextMenu
    :widget="widget"
    :section="section"
    :disabled="!isEditing"
  >
    <UCard
      :variant="cardVariant"
      :color="cardColor"
      class="relative h-full transition-all duration-200"
      :class="{
        'hover:ring-2 hover:ring-primary/40 select-none cursor-grab': isEditing,
        'ring-2 ring-primary/30': isAccent && !isEditing,
        'hover:ring-1 hover:ring-accented cursor-pointer': isLinkable && !isEditing
      }"
      :ui="cardUi"
    >
      <div
        v-if="pluginsAt('top-left').length"
        class="absolute top-2 left-2 flex gap-1"
      >
        <PluginSlot
          v-for="p in pluginsAt('top-left')"
          :key="p.id"
          :plugin-id="p.id"
          :config="p.config"
          :widget="widget"
        />
      </div>
      <div
        v-if="pluginsAt('top-right').length"
        class="absolute top-2 flex gap-1"
        :class="isEditing ? 'right-12' : 'right-2'"
      >
        <PluginSlot
          v-for="p in pluginsAt('top-right')"
          :key="p.id"
          :plugin-id="p.id"
          :config="p.config"
          :widget="widget"
        />
      </div>

      <component
        :is="variantComponent"
        v-if="variantComponent"
        :options="widget.options"
      />
      <div
        v-else
        class="text-sm text-dimmed"
        :style="{ padding: 'var(--layout-card-padding)' }"
      >
        Unknown widget: {{ widget.kind }} / {{ resolvedStyle }}
      </div>

      <div
        v-if="pluginsAt('bottom-left').length"
        class="absolute bottom-2 left-2 flex gap-1"
      >
        <PluginSlot
          v-for="p in pluginsAt('bottom-left')"
          :key="p.id"
          :plugin-id="p.id"
          :config="p.config"
          :widget="widget"
        />
      </div>
      <div
        v-if="pluginsAt('bottom-right').length"
        class="absolute bottom-2 right-2 flex gap-1"
      >
        <PluginSlot
          v-for="p in pluginsAt('bottom-right')"
          :key="p.id"
          :plugin-id="p.id"
          :config="p.config"
          :widget="widget"
        />
      </div>

      <template
        v-if="pluginsAt('footer').length"
        #footer
      >
        <div class="flex gap-2">
          <PluginSlot
            v-for="p in pluginsAt('footer')"
            :key="p.id"
            :plugin-id="p.id"
            :config="p.config"
            :widget="widget"
          />
        </div>
      </template>
    </UCard>
  </EditorContextMenu>
</template>
