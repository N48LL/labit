<script setup lang="ts">
const store = useBoardStore()
const { isEditing, hasUnsavedChanges, enterEditMode, exitEditMode, markDirty } = useEditMode()

const showWidgetPicker = ref(false)
const showBoardSettings = ref(false)

const toast = useToast()

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
  <div class="flex items-center justify-between py-4">
    <div class="flex items-center gap-3">
      <UIcon
        name="i-lucide-rabbit"
        class="size-7 text-primary"
      />
      <input
        v-if="isEditing && store.board"
        :value="store.board.title"
        class="text-xl font-bold bg-transparent border-b border-default outline-none focus:border-primary transition-colors px-0.5"
        @input="store.board!.title = ($event.target as HTMLInputElement).value; markDirty()"
      >
      <h1
        v-else
        class="text-xl font-bold"
      >
        {{ store.board?.title || 'Labbit' }}
      </h1>
    </div>

    <div class="flex items-center gap-2">
      <template v-if="isEditing">
        <UButton
          label="Add Section"
          icon="i-lucide-layout-grid"
          size="sm"
          variant="soft"
          @click="handleAddSection"
        />
        <UButton
          label="Add Widget"
          icon="i-lucide-plus"
          size="sm"
          variant="soft"
          @click="showWidgetPicker = true"
        />
        <UButton
          icon="i-lucide-palette"
          size="sm"
          variant="soft"
          aria-label="Board settings"
          @click="showBoardSettings = true"
        />
        <USeparator
          orientation="vertical"
          class="h-6"
        />
        <UButton
          label="Cancel"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="handleCancel"
        />
        <UButton
          label="Save"
          icon="i-lucide-save"
          size="sm"
          :loading="store.saving"
          @click="handleSave"
        />
      </template>
      <template v-else>
        <UButton
          icon="i-lucide-pencil"
          size="sm"
          variant="ghost"
          color="neutral"
          aria-label="Edit mode"
          @click="enterEditMode"
        />
      </template>
      <UColorModeButton />
    </div>

    <EditorWidgetPicker v-model:open="showWidgetPicker" />
    <EditorBoardSettings v-model:open="showBoardSettings" />
  </div>
</template>
