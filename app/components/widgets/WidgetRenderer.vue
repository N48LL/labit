<script setup lang="ts">
import type { WidgetInstance } from '~~/shared/types'

const props = defineProps<{
  widget: WidgetInstance
}>()

const { getComponent } = useWidgetRegistry()

const component = computed(() => getComponent(props.widget.kind))
</script>

<template>
  <component
    :is="component"
    v-if="component"
    :options="widget.options"
  />
  <div
    v-else
    class="p-4 text-sm text-dimmed"
  >
    Unknown widget: {{ widget.kind }}
  </div>
</template>
