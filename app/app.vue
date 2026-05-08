<script setup lang="ts">
import { isHex } from '~/utils/palette'

const store = useBoardStore()
const { applyPrimary, applyNeutral, customPaletteCss } = useTheme()

const title = computed(() => store.board?.title || 'Labbit')
const description = 'A self-hosted homepage portal with section-based layout and drag-and-drop editing.'

watch(
  () => [store.board?.settings?.theme?.primary, store.board?.settings?.theme?.neutral] as const,
  ([primary, neutral]) => {
    if (primary) applyPrimary(primary)
    if (neutral) applyNeutral(neutral)
  },
  { immediate: true }
)

const favicon = computed(() => {
  const icon = store.board?.icon
  const iconType = store.board?.iconType
  if (!icon || !iconType) return { href: '/favicon.svg', type: 'image/svg+xml' }

  if (iconType === 'iconify') {
    const [prefix, name] = icon.split(':')
    if (prefix && name) {
      const primaryName = store.board?.settings?.theme?.primary
      const hex = isHex(primaryName)
        ? primaryName
        : primaryColors.find(c => c.name === primaryName)?.hex
      const colorParam = hex ? `?color=${encodeURIComponent(hex)}` : ''
      return { href: `https://api.iconify.design/${prefix}/${name}.svg${colorParam}`, type: 'image/svg+xml' }
    }
    return { href: '/favicon.svg', type: 'image/svg+xml' }
  }
  if (iconType === 'custom') {
    return { href: `/api/icons/custom/file/${icon}`, type: undefined }
  }
  return { href: icon, type: undefined }
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: computed(() => [
    {
      rel: 'icon',
      href: favicon.value.href,
      type: favicon.value.type
    }
  ]),
  style: computed(() => customPaletteCss.value
    ? [{ id: 'custom-palette', innerHTML: customPaletteCss.value, tagPriority: 'high' }]
    : []),
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
