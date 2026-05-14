<script setup lang="ts">
import type { SpacerOptions } from '~~/shared/types'

const props = defineProps<{
  options: SpacerOptions
}>()

const { isEditing } = useEditMode()

const width = computed(() => Math.max(0, Math.min(400, props.options.width ?? 60)))
</script>

<template>
  <div
    class="shrink-0"
    :style="{
      width: `${width}px`,
      minWidth: `${width}px`,
      ...(isEditing ? { height: '1.5rem' } : {})
    }"
    :class="isEditing ? 'border border-dashed border-default rounded-md flex items-center justify-center text-[10px] text-dimmed uppercase tracking-wider' : ''"
  >
    <span v-if="isEditing">spacer · {{ width }}px</span>
  </div>
</template>
