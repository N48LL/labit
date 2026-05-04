<script setup lang="ts">
const props = defineProps<{
  selected: string
}>()

const emit = defineEmits<{
  select: [filename: string]
}>()

const open = defineModel<boolean>('open', { default: false })

const isMobile = useMediaQuery('(max-width: 768px)')

const toast = useToast()
const searchQuery = ref('')
const selectedIcon = ref('')
const allIcons = ref<{ filename: string, url: string }[]>([])
const loading = ref(false)

const filteredIcons = computed(() => {
  if (!searchQuery.value) return allIcons.value
  const q = searchQuery.value.toLowerCase()
  return allIcons.value.filter(i => i.filename.toLowerCase().includes(q))
})

watch(open, (val) => {
  if (val) {
    selectedIcon.value = props.selected
    searchQuery.value = ''
    fetchIcons()
  }
})

async function fetchIcons() {
  loading.value = true
  try {
    const data = await $fetch<{ icons: { filename: string, url: string }[] }>('/api/icons/custom')
    allIcons.value = data.icons
  } catch {
    allIcons.value = []
  } finally {
    loading.value = false
  }
}

function selectIcon(filename: string) {
  selectedIcon.value = filename
}

function confirm() {
  if (selectedIcon.value) {
    emit('select', selectedIcon.value)
  }
}

async function deleteIcon(filename: string) {
  try {
    await $fetch(`/api/icons/custom/${filename}`, { method: 'DELETE' })
    allIcons.value = allIcons.value.filter(i => i.filename !== filename)
    if (selectedIcon.value === filename) selectedIcon.value = ''
    toast.add({ title: 'Icon deleted', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to delete icon', color: 'error' })
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :fullscreen="isMobile"
    :ui="{ content: 'sm:max-w-3xl sm:h-[80vh]' }"
    title="Custom Icons"
  >
    <template #body>
      <div class="flex flex-col h-full">
        <div class="p-3 border-b border-default">
          <IconUploadZone @uploaded="fetchIcons" />
        </div>

        <div class="p-3 border-b border-default">
          <UInput
            v-model="searchQuery"
            placeholder="Filter icons..."
            icon="i-lucide-search"
          />
        </div>

        <div class="flex-1 overflow-y-auto p-3">
          <div
            v-if="loading"
            class="flex justify-center py-12"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="size-8 animate-spin text-dimmed"
            />
          </div>
          <div
            v-else-if="filteredIcons.length === 0"
            class="text-center py-12 text-dimmed"
          >
            <UIcon
              name="i-lucide-image"
              class="size-8 mb-2"
            />
            <p class="text-sm">
              {{ allIcons.length === 0 ? 'No custom icons yet. Upload one above.' : 'No icons match your filter.' }}
            </p>
          </div>
          <div
            v-else
            class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2"
          >
            <div
              v-for="icon in filteredIcons"
              :key="icon.filename"
              class="group relative flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer"
              :class="selectedIcon === icon.filename ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-transparent hover:bg-elevated'"
              @click="selectIcon(icon.filename)"
            >
              <img
                :src="icon.url"
                :alt="icon.filename"
                class="size-7 object-contain"
              >
              <span class="text-[10px] text-dimmed truncate w-full text-center">{{ icon.filename }}</span>
              <button
                class="absolute -top-1 -right-1 size-5 rounded-full bg-default border border-default flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="deleteIcon(icon.filename)"
              >
                <UIcon
                  name="i-lucide-x"
                  class="size-3 text-dimmed"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <template v-if="selectedIcon">
            <img
              :src="`/api/icons/custom/file/${selectedIcon}`"
              :alt="selectedIcon"
              class="size-8 object-contain"
            >
            <span class="text-sm font-medium">{{ selectedIcon }}</span>
          </template>
          <span
            v-else
            class="text-sm text-dimmed"
          >No icon selected</span>
        </div>
        <div class="flex gap-2">
          <UButton
            label="Cancel"
            variant="ghost"
            color="neutral"
            @click="open = false"
          />
          <UButton
            label="Select"
            :disabled="!selectedIcon"
            @click="confirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
