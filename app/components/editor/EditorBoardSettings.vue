<script setup lang="ts">
import type { LabelDefinition, LayoutId } from '~~/shared/types'
import { LAYOUTS } from '~~/shared/layouts'
import { isHex } from '~/utils/palette'

const open = defineModel<boolean>('open', { default: false })

const store = useBoardStore()
const { markDirty } = useEditMode()
const { applyPrimary, applyNeutral } = useTheme()

const localPrimary = ref('green')
const localNeutral = ref('slate')
const localLayout = ref<LayoutId>('default')
const originalLayout = ref<LayoutId>('default')

const isCustomPrimary = computed(() => isHex(localPrimary.value))
const isCustomNeutral = computed(() => isHex(localNeutral.value))

const customPrimaryHex = computed(() => isCustomPrimary.value ? localPrimary.value : '#3b82f6')
const customNeutralHex = computed(() => isCustomNeutral.value ? localNeutral.value : '#6b7280')

watch(open, (val) => {
  if (val && store.board) {
    localPrimary.value = store.board.settings.theme.primary
    localNeutral.value = store.board.settings.theme.neutral
    localLayout.value = store.board.layout ?? 'default'
    originalLayout.value = localLayout.value
  }
})

function selectLayout(id: LayoutId) {
  localLayout.value = id
  store.setLayout(id)
}

function selectPrimary(color: string) {
  localPrimary.value = color
  applyPrimary(color)
}

function selectNeutral(color: string) {
  localNeutral.value = color
  applyNeutral(color)
}

function onCustomPrimaryInput(event: Event) {
  const hex = (event.target as HTMLInputElement).value
  selectPrimary(hex)
}

function onCustomNeutralInput(event: Event) {
  const hex = (event.target as HTMLInputElement).value
  selectNeutral(hex)
}

function handleSave() {
  if (!store.board) return
  store.board.settings.theme.primary = localPrimary.value
  store.board.settings.theme.neutral = localNeutral.value
  markDirty()
  open.value = false
}

const showCreateLabel = ref(false)
const newLabelName = ref('')
const newLabelColor = ref('blue')
const editingLabelId = ref<string | null>(null)
const editLabelName = ref('')
const editLabelColor = ref('')

const boardLabels = computed(() => store.board?.labels || [])

function createLabel() {
  if (!newLabelName.value.trim()) return
  store.addLabel(newLabelName.value, newLabelColor.value)
  markDirty()
  newLabelName.value = ''
  newLabelColor.value = 'blue'
  showCreateLabel.value = false
}

function deleteLabel(labelId: string) {
  store.removeLabel(labelId)
  markDirty()
}

function startEditLabel(label: LabelDefinition) {
  editingLabelId.value = label.id
  editLabelName.value = label.name
  editLabelColor.value = label.color
}

function saveEditLabel() {
  if (!editingLabelId.value || !editLabelName.value.trim()) return
  store.updateLabel(editingLabelId.value, {
    name: editLabelName.value,
    color: editLabelColor.value
  })
  markDirty()
  editingLabelId.value = null
}

function cancelEditLabel() {
  editingLabelId.value = null
}

function handleCancel() {
  if (store.board) {
    applyPrimary(store.board.settings.theme.primary)
    applyNeutral(store.board.settings.theme.neutral)
    store.setLayout(originalLayout.value)
  }
  open.value = false
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Board Settings"
    description="Customize the look of your board"
  >
    <template #body>
      <div class="flex flex-col gap-6">
        <UFormField
          label="Layout"
          hint="Visual layout for this board"
        >
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="(layout, id) in LAYOUTS"
              :key="id"
              type="button"
              class="flex items-start gap-2 p-3 rounded-md border text-left transition-colors cursor-pointer"
              :class="localLayout === id
                ? 'border-primary bg-primary/10'
                : 'border-default hover:bg-elevated'"
              @click="selectLayout(id as LayoutId)"
            >
              <UIcon
                :name="layout.icon"
                class="size-5 shrink-0 mt-0.5"
              />
              <span class="min-w-0 flex flex-col">
                <span class="font-medium text-sm">{{ layout.label }}</span>
                <span
                  v-if="layout.description"
                  class="text-xs text-dimmed"
                >{{ layout.description }}</span>
              </span>
            </button>
          </div>
        </UFormField>

        <UFormField label="Primary Color">
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in primaryColors"
              :key="color.name"
              class="group flex flex-col items-center gap-1 cursor-pointer"
              @click="selectPrimary(color.name)"
            >
              <span
                class="block size-8 rounded-full transition-all"
                :class="localPrimary === color.name ? 'ring-2 ring-offset-2 ring-primary ring-offset-default' : 'hover:scale-110'"
                :style="{ backgroundColor: color.hex }"
              />
              <span class="text-[10px] text-dimmed">{{ color.label }}</span>
            </button>
            <label class="group flex flex-col items-center gap-1 cursor-pointer relative">
              <span
                class="block size-8 rounded-full transition-all"
                :class="isCustomPrimary ? 'ring-2 ring-offset-2 ring-primary ring-offset-default' : 'hover:scale-110'"
                :style="{ background: isCustomPrimary ? customPrimaryHex : 'conic-gradient(from 0deg, #ef4444, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #ef4444)' }"
              />
              <span class="text-[10px] text-dimmed">Custom</span>
              <input
                type="color"
                class="absolute inset-0 opacity-0 cursor-pointer"
                :value="customPrimaryHex"
                @input="onCustomPrimaryInput"
              >
            </label>
          </div>
        </UFormField>

        <UFormField label="Background Color">
          <div class="flex flex-wrap gap-3">
            <button
              v-for="color in neutralColors"
              :key="color.name"
              class="flex flex-col items-center gap-1 cursor-pointer"
              @click="selectNeutral(color.name)"
            >
              <span
                class="block size-8 rounded-full transition-all"
                :class="localNeutral === color.name ? 'ring-2 ring-offset-2 ring-primary ring-offset-default' : 'hover:scale-110'"
                :style="{ backgroundColor: color.hex }"
              />
              <span class="text-[10px] text-dimmed">{{ color.label }}</span>
            </button>
            <label class="flex flex-col items-center gap-1 cursor-pointer relative">
              <span
                class="block size-8 rounded-full transition-all"
                :class="isCustomNeutral ? 'ring-2 ring-offset-2 ring-primary ring-offset-default' : 'hover:scale-110'"
                :style="{ background: isCustomNeutral ? customNeutralHex : 'conic-gradient(from 0deg, #ef4444, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #ef4444)' }"
              />
              <span class="text-[10px] text-dimmed">Custom</span>
              <input
                type="color"
                class="absolute inset-0 opacity-0 cursor-pointer"
                :value="customNeutralHex"
                @input="onCustomNeutralInput"
              >
            </label>
          </div>
        </UFormField>

        <UFormField label="Labels">
          <div class="flex flex-col gap-3">
            <div
              v-if="boardLabels.length"
              class="flex flex-col gap-2"
            >
              <div
                v-for="label in boardLabels"
                :key="label.id"
                class="flex items-center gap-2"
              >
                <template v-if="editingLabelId === label.id">
                  <UInput
                    v-model="editLabelName"
                    size="xs"
                    class="flex-1"
                    :maxlength="20"
                  />
                  <div class="flex gap-1">
                    <button
                      v-for="color in labelColors"
                      :key="color.name"
                      class="size-4 rounded-full transition-all cursor-pointer"
                      :class="editLabelColor === color.name ? 'ring-2 ring-offset-1 ring-primary ring-offset-default' : ''"
                      :style="{ backgroundColor: color.hex }"
                      @click="editLabelColor = color.name"
                    />
                  </div>
                  <UButton
                    icon="i-lucide-check"
                    size="xs"
                    variant="ghost"
                    @click="saveEditLabel"
                  />
                  <UButton
                    icon="i-lucide-x"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    @click="cancelEditLabel"
                  />
                </template>
                <template v-else>
                  <span
                    class="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md cursor-pointer"
                    :style="{ backgroundColor: labelHex[label.color] + '20', color: labelHex[label.color] }"
                    @click="startEditLabel(label)"
                  >
                    {{ label.name }}
                  </span>
                  <button
                    class="cursor-pointer ml-auto opacity-60 hover:opacity-100 transition-opacity"
                    @click="deleteLabel(label.id)"
                  >
                    <UIcon
                      name="i-lucide-x"
                      class="size-3.5 text-dimmed hover:text-default"
                    />
                  </button>
                </template>
              </div>
            </div>
            <p
              v-else
              class="text-sm text-dimmed"
            >
              No labels defined yet.
            </p>

            <UButton
              v-if="!showCreateLabel"
              label="Add label"
              icon="i-lucide-plus"
              size="xs"
              variant="soft"
              @click="showCreateLabel = true"
            />
            <div
              v-if="showCreateLabel"
              class="flex flex-col gap-2 p-3 rounded-lg border border-default"
            >
              <UInput
                v-model="newLabelName"
                placeholder="Label name"
                size="sm"
                :maxlength="20"
              />
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="color in labelColors"
                  :key="color.name"
                  class="size-5 rounded-full transition-all cursor-pointer"
                  :class="newLabelColor === color.name ? 'ring-2 ring-offset-1 ring-primary ring-offset-default' : 'hover:scale-110'"
                  :style="{ backgroundColor: color.hex }"
                  @click="newLabelColor = color.name"
                />
              </div>
              <div class="flex gap-2">
                <UButton
                  label="Add"
                  size="xs"
                  :disabled="!newLabelName.trim()"
                  @click="createLabel"
                />
                <UButton
                  label="Cancel"
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  @click="showCreateLabel = false"
                />
              </div>
            </div>
          </div>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          label="Cancel"
          variant="ghost"
          color="neutral"
          @click="handleCancel"
        />
        <UButton
          label="Save"
          @click="handleSave"
        />
      </div>
    </template>
  </USlideover>
</template>
