<script setup lang="ts">
const props = defineProps<{
  icon: string
  iconType: 'iconify' | 'url' | 'custom'
}>()

const emit = defineEmits<{
  'update:icon': [value: string]
  'update:iconType': [value: 'iconify' | 'url' | 'custom']
}>()

const activeTab = computed({
  get: () => props.iconType,
  set: (val: string) => emit('update:iconType', val as 'iconify' | 'url' | 'custom')
})

const showIconifyBrowser = ref(false)
const showCustomBrowser = ref(false)

const urlInput = ref(props.icon)

watch(() => props.icon, (val) => {
  if (props.iconType === 'url') urlInput.value = val
})

function onUrlChange(val: string) {
  urlInput.value = val
  emit('update:icon', val)
}

function onIconifySelect(iconName: string) {
  emit('update:icon', iconName)
  showIconifyBrowser.value = false
}

function onCustomSelect(filename: string) {
  emit('update:icon', filename)
  showCustomBrowser.value = false
}

const tabs = [
  { label: 'Iconify', value: 'iconify', icon: 'i-lucide-search' },
  { label: 'Custom', value: 'custom', icon: 'i-lucide-upload' },
  { label: 'URL', value: 'url', icon: 'i-lucide-link' }
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <UTabs
      v-model="activeTab"
      :items="tabs"
      size="sm"
    />

    <div
      v-if="activeTab === 'iconify'"
      class="flex flex-col gap-3"
    >
      <div class="flex items-center gap-3 p-3 rounded-lg border border-default">
        <UIcon
          v-if="icon && iconType === 'iconify'"
          :name="icon"
          class="size-8 text-primary"
        />
        <div
          v-else
          class="size-8 rounded bg-elevated"
        />
        <span class="text-sm text-muted truncate">{{ icon || 'No icon selected' }}</span>
      </div>
      <UButton
        label="Browse Icons"
        icon="i-lucide-search"
        variant="soft"
        block
        @click="showIconifyBrowser = true"
      />
    </div>

    <div
      v-if="activeTab === 'custom'"
      class="flex flex-col gap-3"
    >
      <div class="flex items-center gap-3 p-3 rounded-lg border border-default">
        <img
          v-if="icon && iconType === 'custom'"
          :src="`/api/icons/custom/file/${icon}`"
          :alt="icon"
          class="size-8 rounded object-contain"
        >
        <div
          v-else
          class="size-8 rounded bg-elevated"
        />
        <span class="text-sm text-muted truncate">{{ icon || 'No icon selected' }}</span>
      </div>
      <UButton
        label="Browse Custom Icons"
        icon="i-lucide-folder-open"
        variant="soft"
        block
        @click="showCustomBrowser = true"
      />
    </div>

    <div
      v-if="activeTab === 'url'"
      class="flex flex-col gap-3"
    >
      <UInput
        :model-value="urlInput"
        placeholder="https://example.com/icon.png"
        type="url"
        @update:model-value="onUrlChange"
      />
      <div
        v-if="urlInput"
        class="flex items-center gap-3 p-3 rounded-lg border border-default"
      >
        <img
          :src="urlInput"
          class="size-8 rounded object-contain"
          alt="Preview"
        >
        <span class="text-sm text-muted">Preview</span>
      </div>
    </div>

    <IconBrowserIconify
      v-model:open="showIconifyBrowser"
      :selected="iconType === 'iconify' ? icon : ''"
      @select="onIconifySelect"
    />
    <IconBrowserCustom
      v-model:open="showCustomBrowser"
      :selected="iconType === 'custom' ? icon : ''"
      @select="onCustomSelect"
    />
  </div>
</template>
