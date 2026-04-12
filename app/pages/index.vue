<script setup lang="ts">
const store = useBoardStore()
const appConfig = useAppConfig()

await store.load('default')

watch(() => store.board?.settings.theme, (theme) => {
  if (theme) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appConfig.ui.colors.primary = theme.primary as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appConfig.ui.colors.neutral = theme.neutral as any
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen">
    <BoardBackground
      v-if="store.board"
      :settings="store.board.settings"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <BoardToolbar />

      <div
        v-if="store.loading"
        class="flex justify-center py-20"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-8 animate-spin text-dimmed"
        />
      </div>

      <BoardView v-else-if="store.board" />

      <div
        v-else
        class="text-center py-20 text-dimmed"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="size-12 mb-4"
        />
        <p>Failed to load board.</p>
      </div>
    </div>
  </div>
</template>
