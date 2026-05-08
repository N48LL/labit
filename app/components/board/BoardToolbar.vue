<script setup lang="ts">
const store = useBoardStore()
const { isEditing, hasUnsavedChanges, showWidgetPicker, enterEditMode, exitEditMode, markDirty } = useEditMode()
const showBoardSettings = ref(false)
const showIconPicker = ref(false)

const readOnly = useRuntimeConfig().public.readOnly

const toast = useToast()

const boardIcon = computed(() => store.board?.icon || 'i-lucide-rabbit')
const boardIconType = computed<'iconify' | 'url' | 'custom'>(() => store.board?.iconType || 'iconify')

function updateIcon(value: string) {
  if (!store.board) return
  store.board.icon = value
  markDirty()
}

function updateIconType(value: 'iconify' | 'url' | 'custom') {
  if (!store.board) return
  store.board.iconType = value
  markDirty()
}

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
      <button
        v-if="isEditing"
        type="button"
        class="rounded-md hover:bg-elevated transition-colors p-1 -m-1 cursor-pointer"
        aria-label="Change icon"
        @click="showIconPicker = true"
      >
        <ServiceIcon
          :icon="boardIcon"
          :icon-type="boardIconType"
          class="size-7"
        />
      </button>
      <ServiceIcon
        v-else
        :icon="boardIcon"
        :icon-type="boardIconType"
        class="size-7"
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
          v-if="!readOnly"
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

    <UModal
      v-model:open="showIconPicker"
      title="Site Icon"
      description="Pick the icon shown in the toolbar and used as the browser favicon."
    >
      <template #body>
        <IconPicker
          :icon="boardIcon"
          :icon-type="boardIconType"
          @update:icon="updateIcon"
          @update:icon-type="updateIconType"
        />
      </template>
      <template #footer>
        <div class="flex justify-end">
          <UButton
            label="Done"
            @click="showIconPicker = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
