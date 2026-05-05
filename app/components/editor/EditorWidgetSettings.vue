<script setup lang="ts">
import type { WidgetInstance, BoardSection, LabelDefinition } from '~~/shared/types'

const props = defineProps<{
  widget: WidgetInstance
  section: BoardSection
}>()

const open = defineModel<boolean>('open', { default: false })

const store = useBoardStore()
const { markDirty } = useEditMode()
const { getDefinition } = useWidgetRegistry()

const definition = computed(() => getDefinition(props.widget.kind))

const localOptions = ref<Record<string, unknown>>({})

const { getAllPlugins } = usePluginRegistry()

const enabledPlugins = computed(() => {
  return getAllPlugins().filter((plugin) => {
    if (plugin.compatibleWith !== '*' && !plugin.compatibleWith.includes(props.widget.kind)) return false
    if (!plugin.settingsComponent) return false
    const widgetEnabled = props.widget.plugins?.[plugin.id]?.enabled
    const sectionEnabled = props.section.defaults?.plugins?.[plugin.id]?.enabled
    return widgetEnabled ?? sectionEnabled ?? false
  })
})

const pluginConfigs = ref<Record<string, Record<string, unknown>>>({})

watch(open, (val) => {
  if (val) {
    localOptions.value = JSON.parse(JSON.stringify(props.widget.options))

    const configs: Record<string, Record<string, unknown>> = {}
    for (const plugin of enabledPlugins.value) {
      configs[plugin.id] = {
        ...plugin.defaultConfig,
        ...(props.section.defaults?.plugins?.[plugin.id]?.config || {}),
        ...(props.widget.plugins?.[plugin.id]?.config || {})
      }
    }
    pluginConfigs.value = configs
  }
})

const showCreateLabel = ref(false)
const newLabelName = ref('')
const newLabelColor = ref('blue')

const assignedLabels = computed(() => {
  const ids = (localOptions.value.labels as string[]) || []
  return ids.map(id => store.getLabel(id)).filter((l): l is LabelDefinition => !!l)
})

const availableLabels = computed(() => {
  const assigned = new Set((localOptions.value.labels as string[]) || [])
  return (store.board?.labels || []).filter(l => !assigned.has(l.id))
})

const canAddMore = computed(() => ((localOptions.value.labels as string[]) || []).length < 3)

function assignLabel(labelId: string) {
  const labels = ((localOptions.value.labels as string[]) || []).slice()
  if (labels.length >= 3 || labels.includes(labelId)) return
  labels.push(labelId)
  localOptions.value.labels = labels
}

function unassignLabel(labelId: string) {
  const labels = ((localOptions.value.labels as string[]) || []).slice()
  localOptions.value.labels = labels.filter(id => id !== labelId)
}

function createAndAssignLabel() {
  if (!newLabelName.value.trim()) return
  const label = store.addLabel(newLabelName.value, newLabelColor.value)
  if (!label) return
  assignLabel(label.id)
  newLabelName.value = ''
  newLabelColor.value = 'blue'
  showCreateLabel.value = false
}

function handleSave() {
  store.updateWidgetOptions(props.section.id, props.widget.id, localOptions.value)

  for (const [pluginId, config] of Object.entries(pluginConfigs.value)) {
    store.updateWidgetPlugins(props.section.id, props.widget.id, {
      [pluginId]: { enabled: true, config }
    })
  }

  markDirty()
  open.value = false
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Widget Settings"
    description="Configure this widget"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2 pb-2 border-b border-default">
          <UIcon
            :name="definition?.icon || 'i-lucide-box'"
            class="size-5"
          />
          <span class="font-medium">{{ definition?.label || widget.kind }}</span>
        </div>

        <template v-if="widget.kind === 'service-link'">
          <UFormField label="Title">
            <UInput
              :model-value="(localOptions.title as string)"
              @update:model-value="localOptions.title = $event"
            />
          </UFormField>
          <UFormField label="Description">
            <UInput
              :model-value="(localOptions.description as string)"
              @update:model-value="localOptions.description = $event"
            />
          </UFormField>
          <UFormField label="URL">
            <UInput
              :model-value="(localOptions.url as string)"
              type="url"
              @update:model-value="localOptions.url = $event"
            />
          </UFormField>
          <USwitch
            :model-value="(localOptions.openInNewTab as boolean)"
            label="Open in new tab"
            @update:model-value="localOptions.openInNewTab = $event"
          />
          <UFormField label="Icon">
            <IconPicker
              :icon="(localOptions.icon as string)"
              :icon-type="(localOptions.iconType as 'iconify' | 'url' | 'custom')"
              @update:icon="localOptions.icon = $event"
              @update:icon-type="localOptions.iconType = $event"
            />
          </UFormField>
          <USwitch
            :model-value="(localOptions.iconBackground as boolean)"
            label="Icon background"
            @update:model-value="localOptions.iconBackground = $event"
          />
          <UFormField label="Labels">
            <div class="flex flex-col gap-2">
              <div
                v-if="assignedLabels.length"
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="label in assignedLabels"
                  :key="label.id"
                  class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md"
                  :style="{ backgroundColor: labelHex[label.color] + '20', color: labelHex[label.color] }"
                >
                  {{ label.name }}
                  <button
                    class="cursor-pointer hover:opacity-100 opacity-60"
                    @click="unassignLabel(label.id)"
                  >
                    <UIcon
                      name="i-lucide-x"
                      class="size-3"
                    />
                  </button>
                </span>
              </div>

              <USelectMenu
                v-if="canAddMore && availableLabels.length > 0"
                placeholder="Add a label..."
                :items="availableLabels.map(l => ({ label: l.name, value: l.id, color: l.color }))"
                :model-value="undefined"
                @update:model-value="assignLabel(typeof $event === 'string' ? $event : $event.value)"
              />

              <UButton
                v-if="canAddMore && !showCreateLabel"
                label="Create new label"
                icon="i-lucide-plus"
                size="xs"
                variant="ghost"
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
                    @click="createAndAssignLabel"
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
        </template>

        <template v-if="widget.kind === 'clock'">
          <UFormField label="Size">
            <USelect
              :model-value="(localOptions.size as string) || 'md'"
              :items="[
                { label: 'Small', value: 'sm' },
                { label: 'Medium', value: 'md' },
                { label: 'Large', value: 'lg' },
                { label: 'Extra Large', value: 'xl' }
              ]"
              @update:model-value="localOptions.size = $event"
            />
          </UFormField>
          <USwitch
            :model-value="(localOptions.format24h as boolean)"
            label="24-hour format"
            @update:model-value="localOptions.format24h = $event"
          />
          <USwitch
            :model-value="(localOptions.showSeconds as boolean)"
            label="Show seconds"
            @update:model-value="localOptions.showSeconds = $event"
          />
          <USwitch
            :model-value="(localOptions.showDate as boolean)"
            label="Show date"
            @update:model-value="localOptions.showDate = $event"
          />
        </template>

        <template v-if="widget.kind === 'notes'">
          <UFormField label="Content">
            <UTextarea
              :model-value="(localOptions.content as string)"
              :rows="6"
              @update:model-value="localOptions.content = $event"
            />
          </UFormField>
        </template>

        <USeparator
          v-if="enabledPlugins.length > 0"
          class="my-2"
        />

        <template
          v-for="plugin in enabledPlugins"
          :key="plugin.id"
        >
          <div class="flex items-center gap-2 pb-2">
            <UIcon
              :name="plugin.icon"
              class="size-4 text-dimmed"
            />
            <span class="text-sm font-medium text-muted">{{ plugin.label }}</span>
          </div>
          <component
            :is="plugin.settingsComponent"
            v-model:config="pluginConfigs[plugin.id]"
          />
        </template>
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
