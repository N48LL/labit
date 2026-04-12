<script setup lang="ts">
import type { BoardSection } from '~~/shared/types'

const props = defineProps<{
  section: BoardSection
}>()

const open = defineModel<boolean>('open', { default: false })

const store = useBoardStore()
const { markDirty } = useEditMode()

const localTitle = ref('')
const localColumns = ref(3)
const localLayout = ref<'grid' | 'masonry'>('grid')
const localShowTitle = ref(true)
const localCollapsible = ref(true)
const localCardVariant = ref<string>('outline')

watch(open, (val) => {
  if (val) {
    localTitle.value = props.section.title
    localColumns.value = props.section.columns
    localLayout.value = props.section.layout
    localShowTitle.value = props.section.showTitle
    localCollapsible.value = props.section.collapsible !== false
    localCardVariant.value = props.section.defaults?.cardVariant || 'outline'
  }
})

function handleSave() {
  store.updateSection(props.section.id, {
    title: localTitle.value,
    columns: localColumns.value,
    layout: localLayout.value,
    showTitle: localShowTitle.value,
    collapsible: localCollapsible.value,
    collapsed: localCollapsible.value ? props.section.collapsed : false,
    defaults: {
      ...props.section.defaults,
      cardVariant: localCardVariant.value as BoardSection['defaults']['cardVariant']
    }
  })
  markDirty()
  open.value = false
}

const columnOptions = [
  { label: '1 column', value: '1' },
  { label: '2 columns', value: '2' },
  { label: '3 columns', value: '3' },
  { label: '4 columns', value: '4' },
  { label: '5 columns', value: '5' },
  { label: '6 columns', value: '6' }
]

const variantOptions: { label: string, value: string, description: string }[] = [
  { label: 'Outline', value: 'outline', description: 'Bordered card' },
  { label: 'Accent', value: 'accent', description: 'Colored border' },
  { label: 'Soft', value: 'soft', description: 'Tinted background' },
  { label: 'Subtle', value: 'subtle', description: 'Light background' },
  { label: 'Ghost', value: 'ghost', description: 'No decoration' }
]
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Section Settings"
    description="Configure this section"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField label="Title">
          <UInput v-model="localTitle" />
        </UFormField>

        <UFormField label="Columns">
          <USelect
            :model-value="String(localColumns)"
            :items="columnOptions"
            @update:model-value="localColumns = Number($event)"
          />
        </UFormField>

        <UFormField label="Card Style">
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="opt in variantOptions"
              :key="opt.value"
              class="rounded-lg p-0.5 transition-all cursor-pointer"
              :class="localCardVariant === opt.value ? 'ring-2 ring-primary' : 'ring-1 ring-transparent hover:ring-default'"
              @click="localCardVariant = opt.value"
            >
              <UCard
                :variant="opt.value === 'accent' ? 'outline' : (opt.value as any)"
                :class="{ 'ring-2 ring-primary/30': opt.value === 'accent' }"
                :ui="{ body: 'p-3' }"
              >
                <p class="text-sm font-medium">
                  {{ opt.label }}
                </p>
                <p class="text-xs text-dimmed">
                  {{ opt.description }}
                </p>
              </UCard>
            </button>
          </div>
        </UFormField>

        <USwitch
          v-model="localShowTitle"
          label="Show section title"
        />
        <USwitch
          v-model="localCollapsible"
          label="Allow collapse"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          variant="ghost"
          color="neutral"
          @click="open = false"
        />
        <UButton
          label="Save"
          @click="handleSave"
        />
      </div>
    </template>
  </USlideover>
</template>
