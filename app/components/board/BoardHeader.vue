<script setup lang="ts">
import { resolveHeader } from '~~/shared/resolve-header'
import { resolveLayoutId } from '~~/shared/layouts'
import type { HeaderItem } from '~~/shared/types'

const store = useBoardStore()
const { markDirty } = useEditMode()

const activeLayoutId = computed(() => resolveLayoutId(store.board?.layout))

const header = computed(() => {
  if (!store.board) return null
  return resolveHeader(store.board, activeLayoutId.value)
})

function onUpdateSlot(slot: 'left' | 'center' | 'right', items: HeaderItem[]) {
  store.setHeaderSlot(activeLayoutId.value, slot, items)
  markDirty()
}

function onRemove(itemId: string) {
  store.removeHeaderItem(activeLayoutId.value, itemId)
  markDirty()
}

function onAdd(slot: 'left' | 'center' | 'right', item: HeaderItem) {
  store.addHeaderItem(activeLayoutId.value, slot, item)
  markDirty()
}

function onUpdateOptions(itemId: string, options: Record<string, unknown>) {
  store.updateHeaderItemOptions(activeLayoutId.value, itemId, options)
  markDirty()
}
</script>

<template>
  <div
    v-if="header"
    class="board-header flex items-center"
    :style="{
      minHeight: 'var(--layout-header-height)',
      gap: 'var(--layout-header-gap)',
      paddingBlock: '0.5rem',
      paddingInline: 'var(--layout-header-padding-x)'
    }"
  >
    <HeaderSlot
      :slot-id="'left'"
      :items="header.left"
      @update:items="(items: HeaderItem[]) => onUpdateSlot('left', items)"
      @remove="onRemove"
      @add="onAdd"
      @update-options="onUpdateOptions"
    />
    <HeaderSlot
      :slot-id="'center'"
      :items="header.center"
      class="flex-1 justify-center"
      @update:items="(items: HeaderItem[]) => onUpdateSlot('center', items)"
      @remove="onRemove"
      @add="onAdd"
      @update-options="onUpdateOptions"
    />
    <HeaderSlot
      :slot-id="'right'"
      :items="header.right"
      @update:items="(items: HeaderItem[]) => onUpdateSlot('right', items)"
      @remove="onRemove"
      @add="onAdd"
      @update-options="onUpdateOptions"
    />
  </div>
</template>
