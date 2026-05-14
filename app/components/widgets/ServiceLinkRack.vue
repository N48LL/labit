<script setup lang="ts">
import type { ServiceLinkOptions, BoardSection, WidgetInstance, LabelDefinition } from '~~/shared/types'

const props = defineProps<{
  options: ServiceLinkOptions
  section: BoardSection
  widget: WidgetInstance
}>()

const { isEditing } = useEditMode()
const store = useBoardStore()

const accent = computed(() => props.section.defaults?.cardColor || '#5e6ad2')

const host = computed(() => {
  try {
    return new URL(props.options.url).host || props.options.url
  } catch {
    return props.options.url
  }
})

const resolvedLabels = computed(() => {
  const ids = (props.options.labels as string[]) || []
  return ids.map(id => store.getLabel(id)).filter((l): l is LabelDefinition => !!l)
})

const linkAttrs = computed(() => {
  if (isEditing.value) return {}
  return {
    href: props.options.url,
    target: props.options.openInNewTab ? '_blank' : '_self',
    rel: props.options.openInNewTab ? 'noopener noreferrer' : undefined
  }
})

const healthCfg = computed(() => {
  const widgetPlugin = props.widget.plugins?.['health-check']
  const sectionDefault = props.section.defaults?.plugins?.['health-check']
  const enabled = widgetPlugin?.enabled ?? sectionDefault?.enabled ?? false
  if (!enabled) return null
  const cfg = { ...(sectionDefault?.config || {}), ...(widgetPlugin?.config || {}) }
  const seconds = (cfg.intervalSeconds as number) || 30
  return { intervalMs: seconds * 1000 }
})

const url = computed(() => healthCfg.value ? (props.options.url || '') : '')
const intervalMs = computed(() => healthCfg.value?.intervalMs ?? 0)

const { result } = useHealthCheck(url, intervalMs)

const pingText = computed(() => {
  if (!healthCfg.value) return null
  if (result.value.loading) return '…'
  if (result.value.online === null) return null
  if (!result.value.online) return 'down'
  return `${result.value.latency}ms`
})

const pingColor = computed(() => {
  if (!healthCfg.value) return '#a1a1aa'
  if (result.value.online === false) return '#ef4444'
  if (!result.value.online) return '#a1a1aa'
  return result.value.latency > 200 ? '#f59e0b' : '#22c55e'
})
</script>

<template>
  <component
    :is="isEditing ? 'div' : 'a'"
    v-bind="linkAttrs"
    class="relative flex items-center gap-2.5 min-w-0 -mx-3 -my-2 px-3 py-2"
    :style="{
      borderLeftWidth: '3px',
      borderLeftStyle: 'solid',
      borderLeftColor: accent
    }"
  >
    <span
      class="shrink-0 size-[26px] flex items-center justify-center"
      :style="{ backgroundColor: accent + '20' }"
    >
      <ServiceIcon
        :icon="options.icon"
        :icon-type="options.iconType"
        class="size-[18px]"
      />
    </span>

    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 min-w-0">
        <span class="text-[13px] font-semibold leading-tight truncate">{{ options.title }}</span>
        <span
          v-if="options.description"
          class="text-[11px] text-dimmed truncate"
        >{{ options.description }}</span>
      </div>
      <div class="mt-0.5 flex items-center gap-2 min-w-0 flex-wrap">
        <span class="text-[11px] text-dimmed truncate font-mono">{{ host }}</span>
        <span
          v-for="label in resolvedLabels"
          :key="label.id"
          class="shrink-0 inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md"
          :style="{ backgroundColor: labelHex[label.color] + '20', color: labelHex[label.color] }"
        >
          {{ label.name }}
        </span>
      </div>
    </div>

    <span
      v-if="pingText"
      class="shrink-0 inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold tabular-nums"
      :style="{ color: pingColor }"
    >
      <span
        class="block size-[6px] rounded-full"
        :style="{ backgroundColor: 'currentColor' }"
      />
      {{ pingText }}
    </span>
  </component>
</template>
