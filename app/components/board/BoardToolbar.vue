<script setup lang="ts">
const store = useBoardStore()
const { isEditing, hasUnsavedChanges, showWidgetPicker, enterEditMode, exitEditMode, markDirty } = useEditMode()
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
  <div class="flex flex-wrap items-center gap-y-2 py-4">
    <div class="flex items-center gap-3 mr-auto">
      <UIcon
        name="i-lucide-rabbit"
        class="size-7 text-primary"
      />
      <input
        v-if="isEditing && store.board"
        :value="store.board.title"
        class="text-xl font-bold bg-transparent border-b border-default outline-none focus:border-primary transition-colors px-0.5 min-w-0 w-32 sm:w-auto"
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
          class="h-6 hidden sm:block"
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
      </template>
      <template v-else>
        <UButton
          icon="i-lucide-pencil"
          size="md"
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
