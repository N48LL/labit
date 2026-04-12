<script setup lang="ts">
import type { ClockOptions } from '~~/shared/types'
import { useNow, useDateFormat } from '@vueuse/core'

const props = defineProps<{
  options: ClockOptions
}>()

const now = useNow({ interval: 1000 })

const timeFormat = computed(() => {
  let fmt = props.options.format24h ? 'HH:mm' : 'hh:mm A'
  if (props.options.showSeconds) {
    fmt = props.options.format24h ? 'HH:mm:ss' : 'hh:mm:ss A'
  }
  return fmt
})

const time = useDateFormat(now, timeFormat)
const date = useDateFormat(now, 'dddd, MMMM D, YYYY')
</script>

<template>
  <ClientOnly>
    <div class="text-center">
      <p class="text-2xl font-mono font-bold tabular-nums">
        {{ time }}
      </p>
      <p
        v-if="options.showDate"
        class="text-sm text-dimmed mt-1"
      >
        {{ date }}
      </p>
    </div>
    <template #fallback>
      <div class="text-center">
        <p class="text-2xl font-mono font-bold tabular-nums">
&nbsp;
        </p>
      </div>
    </template>
  </ClientOnly>
</template>
