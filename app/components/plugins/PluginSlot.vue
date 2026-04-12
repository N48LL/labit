<script setup lang="ts">
import type { WidgetInstance } from '~~/shared/types'

const props = defineProps<{
  pluginId: string
  config: Record<string, unknown>
  widget: WidgetInstance
}>()

const { getPlugin } = usePluginRegistry()

const plugin = computed(() => getPlugin(props.pluginId))
</script>

<template>
  <component
    :is="plugin?.component"
    v-if="plugin?.component"
    :config="config"
    :widget="widget"
  />
</template>
