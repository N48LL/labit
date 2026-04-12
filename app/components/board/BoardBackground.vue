<script setup lang="ts">
import type { BoardSettings } from '~~/shared/types'

const props = defineProps<{
  settings: BoardSettings
}>()

const style = computed(() => {
  const bg = props.settings.background
  if (bg.type === 'none') return {}
  if (bg.type === 'color') return { backgroundColor: bg.value }
  if (bg.type === 'gradient') return { backgroundImage: bg.value }
  if (bg.type === 'image') {
    return {
      backgroundImage: `url(${bg.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: bg.blur ? `blur(${bg.blur}px)` : undefined,
      opacity: bg.opacity ?? 1
    }
  }
  return {}
})
</script>

<template>
  <div
    v-if="settings.background.type !== 'none'"
    class="fixed inset-0 -z-10"
    :style="style"
  />
</template>
