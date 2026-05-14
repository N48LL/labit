<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { HeaderItem } from '~~/shared/types'

const props = defineProps<{
  slotId: 'left' | 'center' | 'right'
  items: HeaderItem[]
}>()

const emit = defineEmits<{
  'update:items': [items: HeaderItem[]]
  'remove': [itemId: string]
  'add': [slotId: 'left' | 'center' | 'right', item: HeaderItem]
}>()

const { isEditing } = useEditMode()

const localItems = computed({
  get: () => props.items,
  set: (value: HeaderItem[]) => emit('update:items', value)
})
</script>

<template>
  <div
    class="flex items-center flex-wrap min-h-0"
    :style="{ gap: 'var(--layout-header-gap)' }"
  >
    <VueDraggable
      v-model="localItems"
      :disabled="!isEditing"
      group="header-items"
      handle=".header-item-handle"
      :animation="200"
      ghost-class="header-item-ghost"
      chosen-class="header-item-chosen"
      drag-class="header-item-drag"
      :force-fallback="true"
      :fallback-on-body="true"
      :fallback-tolerance="3"
      class="flex items-center flex-wrap"
      :style="{ gap: 'var(--layout-header-gap)' }"
    >
      <HeaderItemRenderer
        v-for="item in localItems"
        :key="item.id"
        :item="item"
        :slot-id="slotId"
        @remove="(id: string) => emit('remove', id)"
      />
    </VueDraggable>
    <HeaderAddButton
      v-if="isEditing"
      :slot-id="slotId"
      @add="(s, item) => emit('add', s, item)"
    />
  </div>
</template>
