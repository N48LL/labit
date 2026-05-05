<script setup lang="ts">
import type { ServiceLinkOptions, LabelDefinition } from '~~/shared/types'

const props = defineProps<{
  options: ServiceLinkOptions
}>()

const { isEditing } = useEditMode()

const store = useBoardStore()

const resolvedLabels = computed(() => {
  const labelIds = (props.options.labels as string[]) || []
  return labelIds
    .map(id => store.getLabel(id))
    .filter((l): l is LabelDefinition => !!l)
})

const linkAttrs = computed(() => {
  if (isEditing.value) return {}
  return {
    href: props.options.url,
    target: props.options.openInNewTab ? '_blank' : '_self',
    rel: props.options.openInNewTab ? 'noopener noreferrer' : undefined
  }
})
</script>

<template>
  <component
    :is="isEditing ? 'div' : 'a'"
    v-bind="linkAttrs"
    class="flex items-center gap-4 min-w-0"
  >
    <div
      v-if="options.iconBackground"
      class="size-16 shrink-0 rounded-2xl border border-default bg-white/5 dark:bg-white/10 flex items-center justify-center"
    >
      <ServiceIcon
        :icon="options.icon"
        :icon-type="options.iconType"
        class="size-10"
      />
    </div>
    <ServiceIcon
      v-else
      :icon="options.icon"
      :icon-type="options.iconType"
      class="size-10 shrink-0"
    />
    <div class="min-w-0">
      <p class="font-medium truncate">
        {{ options.title }}
      </p>
      <p
        v-if="options.description"
        class="text-sm text-dimmed truncate"
      >
        {{ options.description }}
      </p>
      <div
        v-if="resolvedLabels.length"
        class="flex flex-wrap gap-1 mt-1"
      >
        <span
          v-for="label in resolvedLabels"
          :key="label.id"
          class="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-md"
          :style="{ backgroundColor: labelHex[label.color] + '20', color: labelHex[label.color] }"
        >
          {{ label.name }}
        </span>
      </div>
    </div>
  </component>
</template>
