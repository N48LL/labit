<script setup lang="ts">
import type { BoardSection } from '~~/shared/types'
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps<{
  section: BoardSection
}>()

const { isEditing, markDirty } = useEditMode()
const store = useBoardStore()

const showSettings = ref(false)
const showDeleteConfirm = ref(false)

function confirmDelete() {
  store.removeSection(props.section.id)
  markDirty()
  showDeleteConfirm.value = false
}

const gridClass = computed(() => {
  const cols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6'
  }
  return cols[props.section.columns] || cols[3]
})

const spanClass: Record<number, string> = {
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6'
}

function onDragChange() {
  markDirty()
}

function toggleCollapse() {
  if (props.section.collapsible === false) return
  store.updateSection(props.section.id, { collapsed: !props.section.collapsed })
  markDirty()
}
</script>

<template>
  <div class="group/section">
    <div
      v-if="section.showTitle || isEditing"
      class="flex items-center gap-2 mb-3"
    >
      <UIcon
        v-if="isEditing"
        name="i-lucide-grip-vertical"
        class="section-handle size-6 cursor-grab text-muted hover:text-default p-1 -ml-1 rounded"
      />
      <button
        v-if="section.showTitle"
        class="flex items-center gap-1.5"
        :class="{ 'cursor-pointer': section.collapsible !== false && section.widgets.length > 0 }"
        @click="toggleCollapse"
      >
        <UIcon
          v-if="section.collapsible !== false && section.widgets.length > 0"
          :name="section.collapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
          class="size-4 text-dimmed"
        />
        <h2 class="text-sm font-semibold text-muted uppercase tracking-wide">
          {{ section.title }}
        </h2>
      </button>
      <div
        v-if="isEditing"
        class="flex items-center gap-1 ml-auto"
      >
        <UButton
          icon="i-lucide-settings"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="showSettings = true"
        />
        <UButton
          icon="i-lucide-trash-2"
          size="sm"
          variant="ghost"
          color="error"
          @click="showDeleteConfirm = true"
        />
      </div>
    </div>

    <div v-show="section.collapsible === false || !section.collapsed">
      <!-- eslint-disable vue/no-mutating-props -->
      <VueDraggable
        v-model="section.widgets"
        :disabled="!isEditing"
        group="widgets"
        :animation="150"
        ghost-class="opacity-30"
        :force-fallback="true"
        :fallback-on-body="true"
        :fallback-tolerance="3"
        :delay="200"
        :delay-on-touch-only="true"
        :touch-start-threshold="5"
        class="grid gap-4"
        :class="gridClass"
        @change="onDragChange"
      >
        <WidgetWrapper
          v-for="widget in section.widgets"
          :key="widget.id"
          :widget="widget"
          :section="section"
          :class="widget.span > 1 ? spanClass[widget.span] : ''"
        />
      </VueDraggable>
      <!-- eslint-enable vue/no-mutating-props -->

      <div
        v-if="section.widgets.length === 0 && isEditing"
        class="border-2 border-dashed border-default rounded-lg p-8 text-center text-dimmed"
      >
        <UIcon
          name="i-lucide-plus"
          class="size-6 mb-2"
        />
        <p class="text-sm">
          Drag widgets here or add from the widget picker
        </p>
      </div>
    </div>

    <EditorSectionSettings
      v-model:open="showSettings"
      :section="section"
    />

    <UModal
      v-model:open="showDeleteConfirm"
      :title="`Delete &quot;${section.title}&quot;?`"
      :description="section.widgets.length
        ? `This section contains ${section.widgets.length} widget${section.widgets.length > 1 ? 's' : ''} that will be removed.`
        : 'This section is empty.'"
    >
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="showDeleteConfirm = false"
          />
          <UButton
            label="Delete"
            color="error"
            @click="confirmDelete"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
