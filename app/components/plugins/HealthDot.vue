<!-- app/components/plugins/HealthDot.vue -->
<script setup lang="ts">
import type { WidgetInstance } from '~~/shared/types'

const props = defineProps<{
  config: Record<string, unknown>
  widget: WidgetInstance
}>()

const healthUrl = computed(() => {
  const custom = props.config.healthCheckUrl as string | undefined
  if (custom) return custom
  const widgetUrl = props.widget.options.url as string | undefined
  return widgetUrl || ''
})

const intervalMs = computed(() => {
  const seconds = (props.config.intervalSeconds as number) || 30
  return seconds * 1000
})

const { result } = useHealthCheck(healthUrl, intervalMs)

const dotColor = computed(() => {
  if (result.value.loading) return 'bg-gray-400 animate-pulse'
  if (result.value.online === null) return 'bg-gray-400'
  return result.value.online ? 'bg-green-500' : 'bg-red-500'
})

const tooltip = computed(() => {
  if (result.value.loading) return 'Checking...'
  if (result.value.online === null) return 'Unknown'
  if (result.value.online) return `Online (${result.value.latency}ms)`
  return result.value.status > 0
    ? `Offline (HTTP ${result.value.status})`
    : 'Offline (unreachable)'
})

const showLatency = computed(() => Boolean(props.config.showLatency))

const latencyText = computed(() => {
  if (!showLatency.value) return ''
  if (result.value.loading) return ''
  if (!result.value.online) return ''
  return `${result.value.latency}ms`
})
</script>

<template>
  <UTooltip :text="tooltip">
    <div class="inline-flex items-center gap-1.5">
      <span
        class="block size-3 rounded-full ring-2 ring-white dark:ring-gray-900"
        :class="dotColor"
      />
      <span
        v-if="latencyText"
        class="text-xs font-medium text-muted tabular-nums"
      >{{ latencyText }}</span>
    </div>
  </UTooltip>
</template>
