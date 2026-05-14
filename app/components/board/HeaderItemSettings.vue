<script setup lang="ts">
import type { HeaderItem, ClockOptions, NetworkInfoOptions } from '~~/shared/types'

const props = defineProps<{ item: HeaderItem }>()
const emit = defineEmits<{
  'update-options': [options: Record<string, unknown>]
  'remove': []
}>()

const clockOptions = computed(() => (props.item.options ?? {}) as unknown as ClockOptions)
const networkOptions = computed(() => (props.item.options ?? {}) as unknown as NetworkInfoOptions)

function set(key: string, value: unknown) {
  emit('update-options', { ...(props.item.options || {}), [key]: value })
}
</script>

<template>
  <div class="p-3 min-w-[240px] flex flex-col gap-3">
    <template v-if="item.type === 'clock'">
      <USwitch
        :model-value="clockOptions.format24h"
        label="24-hour format"
        @update:model-value="set('format24h', $event)"
      />
      <USwitch
        :model-value="clockOptions.showSeconds"
        label="Show seconds"
        @update:model-value="set('showSeconds', $event)"
      />
      <USwitch
        :model-value="clockOptions.showDate"
        label="Show date"
        @update:model-value="set('showDate', $event)"
      />
    </template>

    <template v-else-if="item.type === 'network-info'">
      <USelect
        :model-value="networkOptions.mode || 'server'"
        :items="[
          { label: 'Server IP', value: 'server' },
          { label: 'Viewer IP', value: 'client' }
        ]"
        @update:model-value="set('mode', $event)"
      />
      <USwitch
        :model-value="networkOptions.showFlag"
        label="Show flag"
        @update:model-value="set('showFlag', $event)"
      />
      <USwitch
        :model-value="networkOptions.showIp"
        label="Show IP"
        @update:model-value="set('showIp', $event)"
      />
      <USwitch
        :model-value="networkOptions.showCityCountry"
        label="Show city, country"
        @update:model-value="set('showCityCountry', $event)"
      />
    </template>

    <template v-else>
      <p class="text-xs text-dimmed">
        No options for this item.
      </p>
    </template>

    <USeparator />
    <UButton
      label="Remove from header"
      icon="i-lucide-trash-2"
      color="error"
      variant="soft"
      size="sm"
      block
      @click="emit('remove')"
    />
  </div>
</template>
