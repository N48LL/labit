<script setup lang="ts">
const store = useBoardStore()
const { isEditing, markDirty } = useEditMode()

const showIconPicker = ref(false)

const MAX_TITLE_LENGTH = 30

const boardIcon = computed(() => store.board?.icon || 'i-lucide-rabbit')
const boardIconType = computed<'iconify' | 'url' | 'custom'>(() => store.board?.iconType || 'iconify')

const titleInputSize = computed(() => {
  const len = (store.board?.title || '').length
  return Math.max(len, 4)
})

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
</script>

<template>
  <div class="flex items-center gap-3 min-w-0">
    <button
      v-if="isEditing"
      type="button"
      class="rounded-md hover:bg-elevated transition-colors p-1 -m-1 cursor-pointer shrink-0"
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
      class="size-7 shrink-0"
    />
    <input
      v-if="isEditing && store.board"
      :value="store.board.title"
      :size="titleInputSize"
      :maxlength="MAX_TITLE_LENGTH"
      class="text-xl font-bold bg-transparent border-b border-default outline-none focus:border-primary transition-colors px-0.5 min-w-0"
      @input="store.board!.title = ($event.target as HTMLInputElement).value; markDirty()"
    >
    <h1
      v-else
      class="text-xl font-bold truncate"
    >
      {{ store.board?.title || 'Labbit' }}
    </h1>

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
