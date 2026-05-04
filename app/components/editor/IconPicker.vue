<script setup lang="ts">
const props = defineProps<{
  icon: string
  iconType: 'iconify' | 'url' | 'custom'
}>()

const emit = defineEmits<{
  'update:icon': [value: string]
  'update:iconType': [value: 'iconify' | 'url' | 'custom']
}>()

const toast = useToast()
const showIconifyBrowser = ref(false)
const showCustomBrowser = ref(false)
const downloading = ref(false)

const iconifyValue = ref('')
const imageValue = ref('')
const imageType = ref<'url' | 'custom'>('url')

function initFromProps() {
  if (props.iconType === 'iconify') {
    iconifyValue.value = props.icon
  } else {
    imageValue.value = props.icon
    imageType.value = props.iconType === 'custom' ? 'custom' : 'url'
  }
}
initFromProps()

const activeTab = ref(props.iconType === 'iconify' ? 'iconify' : 'image')

watch(() => [props.icon, props.iconType] as const, ([nextIcon, nextType]) => {
  if (nextType === 'iconify') {
    if (iconifyValue.value !== nextIcon) iconifyValue.value = nextIcon
    if (activeTab.value !== 'iconify') activeTab.value = 'iconify'
  } else {
    const nextImageType = nextType === 'custom' ? 'custom' : 'url'
    if (imageValue.value !== nextIcon) imageValue.value = nextIcon
    if (imageType.value !== nextImageType) imageType.value = nextImageType
    if (activeTab.value !== 'image') activeTab.value = 'image'
  }
})

watch(activeTab, (tab) => {
  if (tab === 'iconify') {
    emit('update:iconType', 'iconify')
    emit('update:icon', iconifyValue.value)
  } else {
    emit('update:iconType', imageType.value)
    emit('update:icon', imageValue.value)
  }
})

function onIconifySelect(iconName: string) {
  iconifyValue.value = iconName
  emit('update:icon', iconName)
  emit('update:iconType', 'iconify')
  showIconifyBrowser.value = false
}

function onUrlInput(val: string) {
  imageValue.value = val
  imageType.value = 'url'
  emit('update:icon', val)
  emit('update:iconType', 'url')
}

function onCustomSelect(filename: string) {
  imageValue.value = filename
  imageType.value = 'custom'
  emit('update:icon', filename)
  emit('update:iconType', 'custom')
  showCustomBrowser.value = false
}

function onUploaded() {
  showCustomBrowser.value = true
}

async function downloadIcon() {
  if (!imageValue.value || imageType.value !== 'url') return

  downloading.value = true
  try {
    const result = await $fetch<{ filename: string }>('/api/icons/custom/download', {
      method: 'POST',
      body: { url: imageValue.value }
    })
    imageValue.value = result.filename
    imageType.value = 'custom'
    emit('update:icon', result.filename)
    emit('update:iconType', 'custom')
    toast.add({ title: 'Icon saved locally', color: 'success' })
  } catch (err: unknown) {
    const message = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Download failed'
    toast.add({ title: 'Download failed', description: message, color: 'error' })
  } finally {
    downloading.value = false
  }
}

const imagePreviewSrc = computed(() => {
  if (!imageValue.value) return ''
  if (imageType.value === 'custom') return `/api/icons/custom/file/${imageValue.value}`
  return imageValue.value
})

const tabs = [
  { label: 'Iconify', value: 'iconify', icon: 'i-lucide-search' },
  { label: 'Image', value: 'image', icon: 'i-lucide-image' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <UTabs
      v-model="activeTab"
      :items="tabs"
      size="sm"
    />

    <!-- Iconify tab -->
    <div
      v-if="activeTab === 'iconify'"
      class="flex flex-col gap-3"
    >
      <div class="flex items-center gap-3 p-3 rounded-lg border border-default">
        <UIcon
          v-if="iconifyValue"
          :name="iconifyValue"
          class="size-8 text-primary"
        />
        <div
          v-else
          class="size-8 rounded bg-elevated"
        />
        <span class="text-sm text-muted truncate">{{ iconifyValue || 'No icon selected' }}</span>
      </div>
      <UButton
        label="Browse Icons"
        icon="i-lucide-search"
        variant="soft"
        block
        @click="showIconifyBrowser = true"
      />
    </div>

    <!-- Image tab (URL + Custom unified) -->
    <div
      v-if="activeTab === 'image'"
      class="flex flex-col gap-3"
    >
      <!-- URL input with download button -->
      <div class="flex gap-2">
        <UInput
          :model-value="imageType === 'url' ? imageValue : ''"
          placeholder="https://example.com/icon.png"
          type="url"
          class="flex-1"
          @update:model-value="onUrlInput"
        />
        <UTooltip text="Save locally">
          <UButton
            icon="i-lucide-download"
            variant="soft"
            :loading="downloading"
            :disabled="!imageValue || imageType !== 'url' || downloading"
            @click="downloadIcon"
          />
        </UTooltip>
      </div>

      <!-- Preview -->
      <div class="flex items-center gap-3 p-3 rounded-lg border border-default">
        <img
          v-if="imagePreviewSrc"
          :src="imagePreviewSrc"
          alt="Preview"
          class="size-8 rounded object-contain"
        >
        <div
          v-else
          class="size-8 rounded bg-elevated"
        />
        <span class="text-sm text-muted truncate">
          {{ imageValue || 'No image selected' }}
        </span>
        <UBadge
          v-if="imageValue"
          :label="imageType === 'custom' ? 'Local' : 'External'"
          :color="imageType === 'custom' ? 'success' : 'warning'"
          variant="subtle"
          size="sm"
          class="ml-auto"
        />
      </div>

      <!-- Upload + Browse -->
      <div class="flex gap-2">
        <UButton
          label="Browse Saved"
          icon="i-lucide-folder-open"
          variant="soft"
          class="flex-1"
          @click="showCustomBrowser = true"
        />
      </div>
      <IconUploadZone @uploaded="onUploaded" />
    </div>

    <IconBrowserIconify
      v-model:open="showIconifyBrowser"
      :selected="iconifyValue"
      @select="onIconifySelect"
    />
    <IconBrowserCustom
      v-model:open="showCustomBrowser"
      :selected="imageType === 'custom' ? imageValue : ''"
      @select="onCustomSelect"
    />
  </div>
</template>
