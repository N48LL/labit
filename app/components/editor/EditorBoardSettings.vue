<script setup lang="ts">
import type { LabelDefinition } from '~~/shared/types'

const open = defineModel<boolean>('open', { default: false })

const store = useBoardStore()
const { markDirty } = useEditMode()
const appConfig = useAppConfig()

const localPrimary = ref('green')
const localNeutral = ref('slate')

watch(open, (val) => {
  if (val && store.board) {
    localPrimary.value = store.board.settings.theme.primary
    localNeutral.value = store.board.settings.theme.neutral
  }
})

function selectPrimary(color: string) {
  localPrimary.value = color
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appConfig.ui.colors.primary = color as any
}

function selectNeutral(color: string) {
  localNeutral.value = color
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appConfig.ui.colors.neutral = color as any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appConfig.ui.colors.primary = store.board.settings.theme.primary as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appConfig.ui.colors.neutral = store.board.settings.theme.neutral as any
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
        <UFormField label="Primary Color">
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in primaryColors"
              :key="color.name"
              class="group flex flex-col items-center gap-1 cursor-pointer"
              @click="selectPrimary(color.name)"
            >
              <div
                class="size-8 rounded-full transition-all"
                :class="localPrimary === color.name ? 'ring-2 ring-offset-2 ring-primary ring-offset-default' : 'hover:scale-110'"
                :style="{ backgroundColor: color.hex }"
              />
              <span class="text-[10px] text-dimmed">{{ color.label }}</span>
            </button>
          </div>
        </UFormField>

        <UFormField label="Neutral Color">
          <div class="flex gap-3">
            <button
              v-for="color in neutralColors"
              :key="color.name"
              class="flex flex-col items-center gap-1 cursor-pointer"
              @click="selectNeutral(color.name)"
            >
              <div
                class="size-8 rounded-full transition-all"
                :class="localNeutral === color.name ? 'ring-2 ring-offset-2 ring-primary ring-offset-default' : 'hover:scale-110'"
                :style="{ backgroundColor: color.hex }"
              />
              <span class="text-[10px] text-dimmed">{{ color.label }}</span>
            </button>
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
