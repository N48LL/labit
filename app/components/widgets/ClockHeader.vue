<script setup lang="ts">
import type { ClockOptions } from '~~/shared/types'

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
const shortDate = useDateFormat(now, 'ddd D MMM')

const showDate = computed(() => props.options.showDate)
</script>

<template>
  <div class="inline-flex items-baseline gap-2 font-mono tabular-nums leading-none">
    <span class="text-[14px] font-semibold">{{ time }}</span>
    <span
      v-if="showDate"
      class="text-[11px] text-dimmed hidden sm:inline"
    >{{ shortDate }}</span>
  </div>
</template>
