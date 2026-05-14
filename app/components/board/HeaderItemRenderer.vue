<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import type { HeaderItem, HeaderItemType, ClockOptions, NetworkInfoOptions, SpacerOptions } from '~~/shared/types'
import HeaderItemSettings from './HeaderItemSettings.vue'

const COMPONENTS: Record<HeaderItemType, Component> = {
  'brand': defineAsyncComponent(() => import('~/components/board/HeaderBrand.vue')),
  'edit-theme-actions': defineAsyncComponent(() => import('~/components/board/HeaderActions.vue')),
  'clock': defineAsyncComponent(() => import('~/components/widgets/ClockHeader.vue')),
  'network-info': defineAsyncComponent(() => import('~/components/widgets/NetworkInfoHeader.vue')),
  'spacer': defineAsyncComponent(() => import('~/components/widgets/SpacerWidget.vue'))
}

const props = defineProps<{
  item: HeaderItem
  slotId: 'left' | 'center' | 'right'
}>()

const emit = defineEmits<{
  'remove': [itemId: string]
  'update-options': [itemId: string, options: Record<string, unknown>]
}>()

const { isEditing } = useEditMode()

const resolved = computed(() => COMPONENTS[props.item.type])

const itemProps = computed(() => {
  if (props.item.type === 'clock') {
    return { options: props.item.options as unknown as ClockOptions }
  }
  if (props.item.type === 'network-info') {
    return { options: props.item.options as unknown as NetworkInfoOptions }
  }
  if (props.item.type === 'spacer') {
    return { options: props.item.options as unknown as SpacerOptions }
  }
  return {}
})

const showSettings = ref(false)
</script>

<template>
  <div
    class="header-item-wrapper relative group/header-item"
    :class="{ 'rounded-md hover:ring-1 hover:ring-primary': isEditing }"
  >
    <button
      v-if="isEditing"
      type="button"
      class="header-item-handle absolute -top-1.5 -left-1.5 z-10 size-5 rounded-full bg-elevated border border-primary flex items-center justify-center cursor-grab opacity-0 group-hover/header-item:opacity-100 transition-opacity"
      aria-label="Drag to reorder"
    >
      <UIcon
        name="i-lucide-grip-vertical"
        class="size-3 text-muted"
      />
    </button>
    <UPopover
      v-if="isEditing && item.type !== 'edit-theme-actions'"
      v-model:open="showSettings"
    >
      <button
        type="button"
        class="absolute -top-1.5 -right-1.5 z-10 size-5 rounded-full bg-elevated border border-primary flex items-center justify-center cursor-pointer opacity-0 group-hover/header-item:opacity-100 transition-opacity"
        aria-label="Item settings"
      >
        <UIcon
          name="i-lucide-cog"
          class="size-3"
        />
      </button>
      <template #content>
        <HeaderItemSettings
          :item="item"
          @update-options="(opts) => emit('update-options', item.id, opts)"
          @remove="() => { showSettings = false; emit('remove', item.id) }"
        />
      </template>
    </UPopover>

    <component
      :is="resolved"
      v-bind="itemProps"
    />
  </div>
</template>
