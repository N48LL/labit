<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const store = useBoardStore()
const { isEditing, markDirty } = useEditMode()
</script>

<template>
  <div>
    <VueDraggable
      v-if="store.board"
      v-model="store.board.sections"
      :disabled="!isEditing"
      handle=".section-handle"
      :animation="150"
      ghost-class="opacity-30"
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
