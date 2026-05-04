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
const date = useDateFormat(now, 'dddd, MMMM D, YYYY')

const timeSizeClass = computed(() => {
  switch (props.options.size) {
    case 'sm': return 'text-xl'
    case 'lg': return 'text-4xl'
    case 'xl': return 'text-6xl'
    default: return 'text-2xl'
  }
})

const dateSizeClass = computed(() => {
  switch (props.options.size) {
    case 'sm': return 'text-xs'
    case 'lg': return 'text-base'
    case 'xl': return 'text-lg'
    default: return 'text-sm'
  }
})
</script>

<template>
  <ClientOnly>
    <div class="text-center">
      <p
        class="font-mono font-bold tabular-nums"
        :class="timeSizeClass"
      >
        {{ time }}
      </p>
      <p
        v-if="options.showDate"
        class="text-dimmed mt-1"
        :class="dateSizeClass"
      >
        {{ date }}
      </p>
    </div>
    <template #fallback>
      <div class="text-center">
        <p
          class="font-mono font-bold tabular-nums"
          :class="timeSizeClass"
        >
&nbsp;
        </p>
      </div>
    </template>
  </ClientOnly>
</template>
