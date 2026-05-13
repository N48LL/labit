<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

// v1: placeholder. Renders Hub-equivalent structure plus a not-yet-implemented
// banner. The full Rack visual (dense 4-col grid with color stripes and live-
// stats strip) lands in a follow-up implementation pass.

const store = useBoardStore()
const { isEditing, markDirty } = useEditMode()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <BoardToolbar />
    <div class="mb-4 rounded-lg border border-dashed border-default px-4 py-2 text-xs text-dimmed">
      <UIcon
        name="i-lucide-server"
        class="size-3.5 mr-1.5 -mt-px inline-block"
      />
      Layout <span class="font-medium text-muted">Rack</span> is selected, but its dedicated visual is not yet implemented. Showing Hub layout for now.
    </div>
    <VueDraggable
      v-if="store.board"
      v-model="store.board.sections"
      :disabled="!isEditing"
      handle=".section-handle"
      :animation="150"
      ghost-class="opacity-30"
      :force-fallback="true"
      :fallback-on-body="true"
      :fallback-tolerance="3"
      class="flex flex-col gap-6"
      @change="markDirty"
    >
      <BoardSection
        v-for="section in store.board.sections"
        :key="section.id"
        :section="section"
      />
    </VueDraggable>
  </div>
</template>
