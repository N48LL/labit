<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import type { HeaderItem, HeaderItemType, ClockOptions, NetworkInfoOptions } from '~~/shared/types'

const props = defineProps<{
  item: HeaderItem
  slotId: 'left' | 'center' | 'right'
}>()

const emit = defineEmits<{
  remove: [itemId: string]
}>()

const { isEditing } = useEditMode()

const componentMap: Record<HeaderItemType, () => Promise<{ default: Component }>> = {
  'brand': () => import('~/components/board/HeaderBrand.vue'),
  'edit-theme-actions': () => import('~/components/board/HeaderActions.vue'),
  'clock': () => import('~/components/widgets/ClockHeader.vue'),
  'network-info': () => import('~/components/widgets/NetworkInfoHeader.vue')
}

const resolved = computed(() => defineAsyncComponent(componentMap[props.item.type]))

const itemProps = computed(() => {
  if (props.item.type === 'clock') {
    return { options: props.item.options as unknown as ClockOptions }
  }
  if (props.item.type === 'network-info') {
    return { options: props.item.options as unknown as NetworkInfoOptions }
  }
  return {}
})

function onRemove() {
  emit('remove', props.item.id)
}
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
    <button
      v-if="isEditing"
      type="button"
      class="absolute -top-1.5 -right-1.5 z-10 size-5 rounded-full bg-elevated border border-primary flex items-center justify-center cursor-pointer opacity-0 group-hover/header-item:opacity-100 transition-opacity hover:text-error"
      aria-label="Remove item"
      @click="onRemove"
    >
      <UIcon
        name="i-lucide-x"
        class="size-3"
      />
    </button>

    <component
      :is="resolved"
      v-bind="itemProps"
    />
  </div>
</template>
