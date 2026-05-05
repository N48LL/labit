<script setup lang="ts">
const props = defineProps<{
  selected: string
}>()

const emit = defineEmits<{
  select: [iconName: string]
}>()

const open = defineModel<boolean>('open', { default: false })

const isMobile = useMediaQuery('(max-width: 768px)')

const searchQuery = ref('')
const activeCollection = ref('lucide')
const selectedIcon = ref('')
const icons = ref<string[]>([])
const total = ref(0)
const loading = ref(false)
let fetchGeneration = 0

const collections = [
  { id: 'all', name: 'All', description: 'Search all collections' },
  { id: 'lucide', name: 'Lucide', description: 'UI icons' },
  { id: 'simple-icons', name: 'Simple Icons', description: 'Brand logos' }
]

watch(open, (val) => {
  if (val) {
    selectedIcon.value = props.selected
    searchQuery.value = ''
    if (activeCollection.value === 'all') activeCollection.value = 'lucide'
    fetchIcons()
  }
})

watch(activeCollection, () => {
  icons.value = []
  if (activeCollection.value === 'all' && searchQuery.value.length < 2) {
    return
  }
  fetchIcons()
})

const debouncedSearch = useDebounceFn(() => {
  icons.value = []
  fetchIcons()
}, 300)

watch(searchQuery, () => {
  debouncedSearch()
})

function buildParams(offset = 0): Record<string, string> | null {
  const params: Record<string, string> = { limit: '50', offset: String(offset) }
  if (searchQuery.value.length >= 2) {
    params.q = searchQuery.value
    if (activeCollection.value !== 'all') params.collection = activeCollection.value
  } else if (activeCollection.value !== 'all') {
    params.collection = activeCollection.value
  } else {
    return null
  }
  return params
}

async function fetchIcons() {
  const params = buildParams()
  if (!params) {
    loading.value = false
    icons.value = []
    total.value = 0
    return
  }

  const gen = ++fetchGeneration
  loading.value = true
  try {
    const data = await $fetch<{ icons: string[], total: number }>('/api/icons/search', { params })
    if (gen !== fetchGeneration) return
    icons.value = data.icons
    total.value = data.total
  } catch {
    if (gen !== fetchGeneration) return
    icons.value = []
    total.value = 0
  } finally {
    if (gen === fetchGeneration) loading.value = false
  }
}

async function loadMore() {
  const params = buildParams(icons.value.length)
  if (!params) return

  const gen = ++fetchGeneration
  loading.value = true
  try {
    const data = await $fetch<{ icons: string[], total: number }>('/api/icons/search', { params })
    if (gen !== fetchGeneration) return
    icons.value.push(...data.icons)
    total.value = data.total
  } finally {
    if (gen === fetchGeneration) loading.value = false
  }
}

function selectIcon(name: string) {
  selectedIcon.value = name
}

function confirm() {
  if (selectedIcon.value) {
    emit('select', selectedIcon.value)
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :fullscreen="isMobile"
    :ui="{ content: 'sm:max-w-4xl sm:h-[80vh]' }"
    title="Browse Icons"
  >
    <template #body>
      <div class="flex h-full">
        <div class="w-48 shrink-0 border-r border-default p-3 flex flex-col gap-1">
          <button
            v-for="col in collections"
            :key="col.id"
            class="flex flex-col gap-0.5 p-2 rounded-lg text-left transition-colors cursor-pointer"
            :class="activeCollection === col.id ? 'bg-elevated text-highlighted' : 'text-muted hover:bg-elevated/50'"
            @click="activeCollection = col.id"
          >
            <span class="text-sm font-medium">{{ col.name }}</span>
            <span class="text-xs text-dimmed">{{ col.description }}</span>
          </button>
        </div>

        <div class="flex-1 flex flex-col min-w-0">
          <div class="p-3 border-b border-default">
            <UInput
              v-model="searchQuery"
              placeholder="Search icons... (min 2 characters)"
              icon="i-lucide-search"
              size="lg"
              autofocus
            />
          </div>

          <div class="flex-1 overflow-y-auto p-3">
            <div
              v-if="loading && icons.length === 0"
              class="flex justify-center py-12"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-8 animate-spin text-dimmed"
              />
            </div>
            <div
              v-else-if="icons.length === 0"
              class="text-center py-12 text-dimmed"
            >
              <UIcon
                name="i-lucide-search-x"
                class="size-8 mb-2"
              />
              <p class="text-sm">
                {{ searchQuery.length >= 2 ? 'No icons found' : activeCollection === 'all' ? 'Type to search across all collections' : 'Type to search or scroll to browse' }}
              </p>
            </div>
            <div
              v-else
              class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2"
            >
              <button
                v-for="name in icons"
                :key="name"
                class="flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer"
                :class="selectedIcon === name ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-transparent hover:bg-elevated'"
                @click="selectIcon(name)"
              >
                <UIcon
                  :name="name"
                  class="size-7"
                />
                <span class="text-[10px] text-dimmed truncate w-full text-center">{{ name.split(':')[1] }}</span>
              </button>
            </div>

            <div
              v-if="icons.length < total"
              class="flex justify-center pt-4"
            >
              <UButton
                label="Load more"
                variant="ghost"
                :loading="loading"
                @click="loadMore"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <template v-if="selectedIcon">
            <UIcon
              :name="selectedIcon"
              class="size-8 text-primary"
            />
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
