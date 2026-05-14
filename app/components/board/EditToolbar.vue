<script setup lang="ts">
const store = useBoardStore()
const { isEditing, hasUnsavedChanges, showWidgetPicker, exitEditMode, markDirty } = useEditMode()
const toast = useToast()

const showBoardSettings = ref(false)

async function handleSave() {
  try {
    await store.save()
    exitEditMode()
  } catch {
    toast.add({ title: 'Failed to save', description: 'Your changes could not be saved. Please try again.', color: 'error' })
  }
}

async function handleCancel() {
  if (hasUnsavedChanges.value) {
    await store.load()
  }
  exitEditMode()
}

function handleAddSection() {
  store.addSection()
  markDirty()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isEditing"
      class="fixed left-1/2 -translate-x-1/2 bottom-4 z-40 flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-default border border-primary shadow-lg backdrop-blur"
    >
      <UButton
        icon="i-lucide-layout-grid"
        size="md"
        variant="soft"
        aria-label="Add Section"
        class="sm:hidden"
        @click="handleAddSection"
      />
      <UButton
        label="Add Section"
        icon="i-lucide-layout-grid"
        size="md"
        variant="soft"
        class="hidden sm:inline-flex"
        @click="handleAddSection"
      />
      <UButton
        icon="i-lucide-plus"
        size="md"
        variant="soft"
        aria-label="Add Widget"
        class="sm:hidden"
        @click="showWidgetPicker = true"
      />
      <UButton
        label="Add Widget"
        icon="i-lucide-plus"
        size="md"
        variant="soft"
        class="hidden sm:inline-flex"
        @click="showWidgetPicker = true"
      />
      <UButton
        icon="i-lucide-palette"
        size="md"
        variant="soft"
        aria-label="Board settings"
        @click="showBoardSettings = true"
      />
      <USeparator
        orientation="vertical"
        class="h-6 hidden sm:block mx-1"
      />
      <UButton
        icon="i-lucide-x"
        size="md"
        variant="ghost"
        color="neutral"
        aria-label="Cancel"
        class="sm:hidden"
        @click="handleCancel"
      />
      <UButton
        label="Cancel"
        size="md"
        variant="ghost"
        color="neutral"
        class="hidden sm:inline-flex"
        @click="handleCancel"
      />
      <UButton
        icon="i-lucide-save"
        size="md"
        :loading="store.saving"
        aria-label="Save"
        class="sm:hidden"
        @click="handleSave"
      />
      <UButton
        label="Save"
        icon="i-lucide-save"
        size="md"
        :loading="store.saving"
        class="hidden sm:inline-flex"
        @click="handleSave"
      />
    </div>
    <EditorWidgetPicker v-model:open="showWidgetPicker" />
    <EditorBoardSettings v-model:open="showBoardSettings" />
  </Teleport>
</template>
