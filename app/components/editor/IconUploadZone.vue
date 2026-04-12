<script setup lang="ts">
const emit = defineEmits<{
  uploaded: []
}>()

const toast = useToast()
const uploading = ref(false)
const dragOver = ref(false)

const ALLOWED_EXT = ['svg', 'png', 'jpg', 'jpeg', 'webp']
const MAX_SIZE = 512 * 1024

const fileInput = ref<HTMLInputElement>()

function triggerFileInput() {
  fileInput.value?.click()
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragOver.value = false
  const files = e.dataTransfer?.files
  if (files?.[0]) handleFile(files[0])
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) handleFile(input.files[0])
  input.value = ''
}

async function handleFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXT.includes(ext)) {
    toast.add({ title: 'Invalid file type', description: `Allowed: ${ALLOWED_EXT.join(', ')}`, color: 'error' })
    return
  }

  if (file.size > MAX_SIZE) {
    toast.add({ title: 'File too large', description: 'Maximum size is 512KB', color: 'error' })
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    await $fetch('/api/icons/custom', { method: 'POST', body: formData })
    toast.add({ title: 'Icon uploaded', color: 'success' })
    emit('uploaded')
  } catch (err: unknown) {
    const message = (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Upload failed'
    toast.add({ title: 'Upload failed', description: message, color: 'error' })
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer"
    :class="dragOver ? 'border-primary bg-primary/5' : 'border-default hover:border-dimmed'"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="ALLOWED_EXT.map(e => `.${e}`).join(',')"
      @change="onFileChange"
    >
    <UIcon
      v-if="uploading"
      name="i-lucide-loader-2"
      class="size-6 animate-spin text-dimmed mb-1"
    />
    <UIcon
      v-else
      name="i-lucide-upload"
      class="size-6 text-dimmed mb-1"
    />
    <p class="text-sm text-dimmed">
      {{ uploading ? 'Uploading...' : 'Drop an icon here or click to upload' }}
    </p>
    <p class="text-xs text-dimmed mt-1">
      SVG, PNG, JPG, WebP (max 512KB)
    </p>
  </div>
</template>
