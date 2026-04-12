<script setup lang="ts">
import type { NotesOptions } from '~~/shared/types'

defineProps<{
  options: NotesOptions
}>()
</script>

<template>
  <div class="prose prose-sm dark:prose-invert max-w-none text-muted">
    <p>{{ options.content }}</p>
  </div>
</template>
