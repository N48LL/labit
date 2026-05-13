<script setup lang="ts">
const store = useBoardStore()
const { applyPrimary, applyNeutral } = useTheme()

if (!store.board) {
  await store.load('default')
}

if (store.board) {
  applyPrimary(store.board.settings.theme.primary)
  applyNeutral(store.board.settings.theme.neutral)
}
</script>

<template>
  <div class="min-h-screen">
    <BoardBackground
      v-if="store.board"
      :settings="store.board.settings"
    />

    <div
      v-if="store.loading"
      class="flex justify-center py-20"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 animate-spin text-dimmed"
      />
    </div>

    <BoardLayoutRenderer v-else-if="store.board" />

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
</template>
