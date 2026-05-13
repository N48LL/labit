<script setup lang="ts">
const store = useBoardStore()
const { getComponent, getDefault } = useLayoutRegistry()

const layoutId = computed(() => store.board?.layout ?? getDefault())
const Layout = computed(() => getComponent(layoutId.value))
</script>

<template>
  <component
    :is="Layout"
    v-if="store.board && Layout"
  />
</template>
