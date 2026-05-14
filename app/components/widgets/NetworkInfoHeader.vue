<script setup lang="ts">
import type { NetworkInfoOptions, NetworkInfoSuccess, NetworkInfoLan } from '~~/shared/types'

const props = defineProps<{
  options: NetworkInfoOptions
}>()

const mode = computed(() => props.options.mode)
const intervalMs = computed(() => props.options.refreshIntervalMs)

const { state } = useNetworkInfo(mode, intervalMs)

const success = computed<NetworkInfoSuccess | null>(() => {
  const data = state.value.data
  if (!data || 'error' in data || ('lan' in data && data.lan === true)) return null
  return data as NetworkInfoSuccess
})

const lan = computed<NetworkInfoLan | null>(() => {
  const data = state.value.data
  if (data && 'lan' in data && data.lan === true) return data as NetworkInfoLan
  return null
})

const ipText = computed(() => success.value?.ip ?? lan.value?.ip ?? '—')
const countryCode = computed(() => success.value?.countryCode?.toLowerCase() ?? null)
const cityCountry = computed(() => {
  const s = success.value
  if (!s) return null
  return [s.city, s.country].filter(Boolean).join(', ')
})

const flagIcon = computed(() => countryCode.value ? `i-circle-flags-${countryCode.value}` : null)
</script>

<template>
  <div class="inline-flex items-center gap-2 leading-none">
    <UIcon
      v-if="options.showFlag && flagIcon"
      :name="flagIcon"
      class="size-4 shrink-0"
    />
    <span
      v-if="options.showIp"
      class="text-[13px] font-mono tabular-nums"
    >{{ ipText }}</span>
    <span
      v-if="options.showCityCountry && cityCountry"
      class="text-[11px] text-dimmed hidden md:inline truncate max-w-[200px]"
    >{{ cityCountry }}</span>
  </div>
</template>
