<script setup lang="ts">
const { isEditing, enterEditMode } = useEditMode()
const readOnly = useRuntimeConfig().public.readOnly
</script>

<template>
  <div class="flex items-center gap-2 shrink-0">
    <UButton
      v-if="!readOnly"
      icon="i-lucide-pencil"
      size="md"
      variant="ghost"
      color="neutral"
      aria-label="Edit mode"
      :disabled="isEditing"
      :class="{ 'opacity-50': isEditing }"
      @click="enterEditMode"
    />
    <UColorModeButton />
  </div>
</template>
