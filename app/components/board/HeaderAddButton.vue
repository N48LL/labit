<script setup lang="ts">
import type { HeaderItem, HeaderItemType } from '~~/shared/types'
import { HEADER_ITEM_TYPES } from '~~/shared/header-items'
import { generateId } from '~/utils/id'

const props = defineProps<{
  slotId: 'left' | 'center' | 'right'
}>()

const emit = defineEmits<{
  add: [slotId: 'left' | 'center' | 'right', item: HeaderItem]
}>()

const open = ref(false)

const LABELS: Record<HeaderItemType, string> = {
  'brand': 'Logo & Title',
  'edit-theme-actions': 'Edit & Theme actions',
  'clock': 'Compact Clock',
  'network-info': 'Compact Network Info',
  'spacer': 'Spacer'
}

const ICONS: Record<HeaderItemType, string> = {
  'brand': 'i-lucide-rabbit',
  'edit-theme-actions': 'i-lucide-settings-2',
  'clock': 'i-lucide-clock',
  'network-info': 'i-lucide-globe',
  'spacer': 'i-lucide-square-dashed'
}

function defaultsFor(type: HeaderItemType): Omit<HeaderItem, 'id'> {
  if (type === 'clock') {
    return { type, options: { format24h: true, showSeconds: false, showDate: false } }
  }
  if (type === 'network-info') {
    return { type, options: { mode: 'server', showFlag: true, showIp: true, showCityCountry: false } }
  }
  if (type === 'spacer') {
    return { type, options: { width: 60 } }
  }
  return { type }
}

function handleAdd(type: HeaderItemType) {
  emit('add', props.slotId, { id: generateId(), ...defaultsFor(type) })
  open.value = false
}
</script>

<template>
  <UPopover v-model:open="open">
    <UButton
      icon="i-lucide-plus"
      size="xs"
      variant="ghost"
      color="neutral"
      :aria-label="`Add to ${slotId} slot`"
    />
    <template #content>
      <div class="p-1 min-w-[200px]">
        <button
          v-for="type in HEADER_ITEM_TYPES"
          :key="type"
          type="button"
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-elevated text-left text-sm cursor-pointer"
          @click="handleAdd(type)"
        >
          <UIcon
            :name="ICONS[type]"
            class="size-4 text-muted"
          />
          <span>{{ LABELS[type] }}</span>
        </button>
      </div>
    </template>
  </UPopover>
</template>
