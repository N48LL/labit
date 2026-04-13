<script setup lang="ts">
import type { WidgetInstance, BoardSection } from '~~/shared/types'

const props = defineProps<{
  widget: WidgetInstance
  section: BoardSection
}>()

const { isEditing } = useEditMode()

const isAccent = computed(() => props.section.defaults?.cardVariant === 'accent')
const isLinkable = computed(() => props.widget.kind === 'service-link')

const cardVariant = computed(() => {
  const variant = props.section.defaults?.cardVariant || 'outline'
  if (variant === 'accent' || variant === 'ghost') return 'outline'
  return variant
})

const cardColor = computed(() => {
  return props.section.defaults?.cardColor || undefined
})

const resolvedPlugins = computed(() => {
  return useResolvedPlugins(props.section, props.widget)
})

function pluginsAt(position: string) {
  return resolvedPlugins.value.filter(p => p.position === position)
}
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
        'ring-2 ring-primary/30 hover:ring-primary/50': isEditing,
        'ring-2 ring-primary/30': isAccent && !isEditing,
        'hover:ring-1 hover:ring-accented cursor-pointer': isLinkable && !isEditing
      }"
      :ui="{ body: 'p-4' }"
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
        class="absolute top-2 right-2 flex gap-1"
      >
        <PluginSlot
          v-for="p in pluginsAt('top-right')"
          :key="p.id"
          :plugin-id="p.id"
          :config="p.config"
          :widget="widget"
        />
      </div>

      <WidgetRenderer :widget="widget" />

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
