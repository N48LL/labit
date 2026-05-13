<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { resolveLayoutId } from '~~/shared/layouts'

const store = useBoardStore()
const { isEditing, markDirty } = useEditMode()

useHead({
  htmlAttrs: {
    'data-layout': computed(() => resolveLayoutId(store.board?.layout))
  }
})
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
      :force-fallback="true"
      :fallback-on-body="true"
      :fallback-tolerance="3"
      class="flex flex-col"
      :style="{ gap: 'var(--layout-section-spacing)' }"
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
