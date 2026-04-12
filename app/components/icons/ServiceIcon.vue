<script setup lang="ts">
const props = defineProps<{
  icon: string
  iconType: 'iconify' | 'url' | 'custom'
}>()

const isIconify = computed(() => props.iconType === 'iconify')
const isCustom = computed(() => props.iconType === 'custom')
const isUrl = computed(() => props.iconType === 'url' || (props.iconType as string) === 'favicon')

const customSrc = computed(() => `/api/icons/custom/file/${props.icon}`)
</script>

<template>
  <UIcon
    v-if="isIconify"
    :name="icon"
    class="text-primary"
  />
  <img
    v-else-if="isCustom"
    :src="customSrc"
    :alt="icon"
    class="rounded object-contain"
  >
  <img
    v-else-if="isUrl"
    :src="icon"
    :alt="icon"
    class="rounded object-contain"
  >
</template>
