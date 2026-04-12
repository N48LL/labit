<script setup lang="ts">
import type { WidgetKind } from '~~/shared/types'

const open = defineModel<boolean>('open', { default: false })

const store = useBoardStore()
const { markDirty } = useEditMode()
const { getAllDefinitions } = useWidgetRegistry()

const definitions = getAllDefinitions()

const targetSectionId = ref('')

const sections = computed(() => {
  return store.board?.sections.map(s => ({
    label: s.title,
    value: s.id
  })) || []
})

watch(open, (val) => {
  if (val && store.board?.sections.length) {
    targetSectionId.value = store.board.sections[0].id
  }
})

function addWidget(kind: WidgetKind, defaultOptions: Record<string, unknown>) {
  if (!targetSectionId.value) return
  store.addWidget(targetSectionId.value, kind, { ...defaultOptions })
  markDirty()
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Add Widget"
    description="Choose a widget to add"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Add to section">
          <USelect
            v-model="targetSectionId"
            :items="sections"
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="def in definitions"
            :key="def.kind"
            class="flex items-center gap-3 p-3 rounded-lg border border-default hover:bg-elevated transition-colors text-left cursor-pointer"
            @click="addWidget(def.kind, def.defaultOptions)"
          >
            <UIcon
              :name="def.icon"
              class="size-8 text-primary shrink-0"
            />
            <div>
              <p class="font-medium text-sm">
                {{ def.label }}
              </p>
              <p class="text-xs text-dimmed">
                {{ def.description }}
              </p>
            </div>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
