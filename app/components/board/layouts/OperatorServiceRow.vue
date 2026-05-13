<script setup lang="ts">
import type { BoardSection, WidgetInstance, ServiceLinkOptions, LabelDefinition } from '~~/shared/types'
import { OPERATOR_HEALTH_KEY } from './operatorKeys'

const props = defineProps<{
  widget: WidgetInstance
  section: BoardSection
  alt?: boolean
}>()

const store = useBoardStore()
const { isEditing } = useEditMode()
const options = computed(() => props.widget.options as unknown as ServiceLinkOptions)

const healthCfg = computed(() => {
  const plug = props.widget.plugins?.['health-check']
  const sectionDefault = props.section.defaults?.plugins?.['health-check']
  const enabled = plug?.enabled ?? sectionDefault?.enabled ?? false
  if (!enabled) return null
  const cfg = { ...(sectionDefault?.config || {}), ...(plug?.config || {}) }
  const seconds = (cfg.intervalSeconds as number) || 30
  return { intervalMs: seconds * 1000 }
})

const url = computed(() => healthCfg.value ? (options.value.url || '') : '')
const intervalMs = computed(() => healthCfg.value?.intervalMs ?? 0)

const { result } = useHealthCheck(url, intervalMs)

const healthMap = inject(OPERATOR_HEALTH_KEY, null)
watch(
  () => ({ on: result.value.online, lat: result.value.latency, loading: result.value.loading }),
  ({ on, lat, loading }) => {
    if (!healthMap) return
    if (!healthCfg.value || loading) {
      healthMap.value.delete(props.widget.id)
    } else {
      healthMap.value.set(props.widget.id, { online: on, latency: lat })
    }
    healthMap.value = new Map(healthMap.value)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (healthMap) {
    healthMap.value.delete(props.widget.id)
    healthMap.value = new Map(healthMap.value)
  }
})

// Status dot: green if up, red if down, amber if slow, neutral if not monitored.
const dotStatus = computed<'up' | 'down' | 'slow' | 'unknown' | 'loading'>(() => {
  if (!healthCfg.value) return 'unknown'
  if (result.value.loading) return 'loading'
  if (result.value.online === null) return 'unknown'
  if (result.value.online === false) return 'down'
  return result.value.latency > 200 ? 'slow' : 'up'
})

const dotStyle = computed(() => {
  const map: Record<string, string> = {
    up: '#22c55e',
    down: '#ef4444',
    slow: '#f59e0b',
    unknown: '#a1a1aa',
    loading: '#a1a1aa'
  }
  const color = map[dotStatus.value] || '#a1a1aa'
  return {
    background: color,
    boxShadow: dotStatus.value === 'unknown' || dotStatus.value === 'loading'
      ? 'none'
      : `0 0 0 3px ${color}25`
  }
})

const latencyText = computed(() => {
  if (!healthCfg.value) return '—'
  if (result.value.loading) return '…'
  if (result.value.online === null) return '—'
  if (!result.value.online) return 'down'
  return `${result.value.latency}ms`
})

const latencyClass = computed(() => {
  if (!healthCfg.value) return 'text-zinc-400 dark:text-zinc-600'
  if (result.value.online === false) return 'text-red-600 dark:text-red-500'
  if (!result.value.online) return 'text-zinc-400 dark:text-zinc-600'
  return result.value.latency > 200
    ? 'text-amber-600 dark:text-amber-500'
    : 'text-zinc-900 dark:text-zinc-100'
})

const host = computed(() => {
  try {
    return new URL(options.value.url).host || options.value.url
  } catch {
    return options.value.url
  }
})

const resolvedLabels = computed(() => {
  const ids = (options.value.labels as string[]) || []
  return ids.map(id => store.getLabel(id)).filter((l): l is LabelDefinition => !!l)
})

const linkAttrs = computed(() => {
  if (isEditing.value) return {}
  return {
    href: options.value.url,
    target: options.value.openInNewTab ? '_blank' : '_self',
    rel: options.value.openInNewTab ? 'noopener noreferrer' : undefined
  }
})

// Stable color seed per row, used for the icon swatch background tint.
const accent = computed(() => props.section.defaults?.cardColor || '#5e6ad2')
</script>

<template>
  <EditorContextMenu
    :widget="widget"
    :section="section"
    :disabled="!isEditing"
  >
    <component
      :is="isEditing ? 'div' : 'a'"
      v-bind="linkAttrs"
      class="grid grid-cols-[28px_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_130px_28px] gap-3 items-center px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 text-[15px] transition-colors"
      :class="[
        alt ? 'bg-zinc-50/60 dark:bg-zinc-950/40' : '',
        isEditing ? 'cursor-grab select-none hover:bg-zinc-100 dark:hover:bg-zinc-800/60' : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
      ]"
    >
      <span class="flex items-center justify-center">
        <span
          class="block size-2.5 rounded-full"
          :style="dotStyle"
        />
      </span>
      <span class="flex items-center gap-3 min-w-0">
        <span
          class="size-8 shrink-0 rounded-md flex items-center justify-center"
          :style="{ background: accent + '1f', color: accent }"
        >
          <ServiceIcon
            :icon="options.icon"
            :icon-type="options.iconType"
            class="size-[20px]"
          />
        </span>
        <span class="font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0 text-[16px]">{{ options.title }}</span>
        <span
          v-if="options.description"
          class="text-zinc-500 dark:text-zinc-500 text-[14.5px] truncate min-w-0"
        >· {{ options.description }}</span>
        <span
          v-for="label in resolvedLabels"
          :key="label.id"
          class="inline-flex items-center font-operator-mono text-[12px] font-semibold uppercase tracking-[0.06em] px-2 py-[2px] rounded shrink-0"
          :style="{ backgroundColor: labelHex[label.color] + '24', color: labelHex[label.color] }"
        >
          {{ label.name }}
        </span>
      </span>
      <span class="text-zinc-500 dark:text-zinc-500 font-operator-mono text-[14px] truncate">{{ host }}</span>
      <span class="min-w-0">
        <span class="inline-flex items-center font-operator-mono text-[12.5px] tracking-[0.06em] px-2.5 py-[3px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-full">
          {{ section.title }}
        </span>
      </span>
      <span
        class="text-right font-operator-mono text-[14px] tabular-nums font-medium"
        :class="latencyClass"
      >
        {{ latencyText }}
      </span>
      <span class="flex justify-end">
        <UIcon
          v-if="!isEditing"
          name="i-lucide-chevron-right"
          class="size-4 text-zinc-300 dark:text-zinc-700"
        />
      </span>
    </component>
  </EditorContextMenu>
</template>
