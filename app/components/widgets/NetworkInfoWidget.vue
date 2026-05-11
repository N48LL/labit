<script setup lang="ts">
import type {
  NetworkInfoOptions,
  NetworkInfoResponse,
  NetworkInfoSuccess,
  NetworkInfoLan,
  NetworkInfoError
} from '~~/shared/types'

const props = defineProps<{
  options: NetworkInfoOptions
}>()

const mode = computed(() => props.options.mode)
const intervalMs = computed(() => props.options.refreshIntervalMs)

const { state } = useNetworkInfo(mode, intervalMs)

const ipSizeClass = computed(() => {
  switch (props.options.size) {
    case 'sm': return 'text-base'
    case 'lg': return 'text-2xl'
    default: return 'text-lg'
  }
})

const flagSizeClass = computed(() => {
  if (props.options.flagStyle === 'square') {
    switch (props.options.size) {
      case 'sm': return 'size-12'
      case 'lg': return 'size-20'
      default: return 'size-16'
    }
  }
  switch (props.options.size) {
    case 'sm': return 'size-6'
    case 'lg': return 'size-12'
    default: return 'size-9'
  }
})

const secondarySizeClass = computed(() => {
  switch (props.options.size) {
    case 'sm': return 'text-xs'
    case 'lg': return 'text-base'
    default: return 'text-sm'
  }
})

const titleSizeClass = computed(() => {
  switch (props.options.size) {
    case 'sm': return 'text-sm'
    case 'lg': return 'text-xl'
    default: return 'text-base'
  }
})

function isError(data: NetworkInfoResponse): data is NetworkInfoError {
  return 'error' in data
}

function isLan(data: NetworkInfoResponse): data is NetworkInfoLan {
  return 'lan' in data && data.lan === true
}

function isSuccess(data: NetworkInfoResponse): data is NetworkInfoSuccess {
  return !isError(data) && !isLan(data)
}

const errorData = computed<NetworkInfoError | null>(() => {
  const data = state.value.data
  return data && isError(data) ? data : null
})

const lanData = computed<NetworkInfoLan | null>(() => {
  const data = state.value.data
  return data && isLan(data) ? data : null
})

const successData = computed<NetworkInfoSuccess | null>(() => {
  const data = state.value.data
  return data && isSuccess(data) ? data : null
})

const displayIp = computed(() => successData.value?.ip ?? lanData.value?.ip ?? '')

const countryCode = computed(() => successData.value?.countryCode ?? '')

const flagIcon = computed(() => {
  if (!countryCode.value) return null
  return flagIconName(countryCode.value, props.options.flagStyle)
})

const flagShapeClass = computed(() => {
  switch (props.options.flagStyle) {
    case 'rectangular': return 'rounded-sm'
    case 'square': return 'rounded-2xl'
    case 'circle':
    default: return 'rounded-full'
  }
})

const cityCountryLine = computed(() => {
  const data = successData.value
  if (!data) return ''
  const parts = [data.city, data.country].filter(Boolean)
  return parts.join(', ')
})

const lanLine = computed(() => (lanData.value ? 'LAN — geolocation unavailable' : ''))
</script>

<template>
  <ClientOnly>
    <div class="min-w-0">
      <p
        v-if="options.title"
        class="font-medium truncate mb-1.5"
        :class="titleSizeClass"
      >
        {{ options.title }}
      </p>
      <div class="flex items-start gap-3 min-w-0">
        <template v-if="options.showFlag">
          <UIcon
            v-if="flagIcon"
            :name="flagIcon"
            :class="[flagSizeClass, flagShapeClass, 'shrink-0 overflow-hidden']"
            :aria-label="successData?.country"
          />
          <div
            v-else
            :class="[flagSizeClass, flagShapeClass, 'shrink-0 bg-elevated flex items-center justify-center']"
          >
            <UIcon
              name="i-lucide-globe"
              class="size-1/2 text-dimmed"
            />
          </div>
        </template>

        <div class="min-w-0 flex-1">
          <div
            v-if="errorData"
            class="flex items-center gap-2 text-dimmed"
            :class="ipSizeClass"
            :title="errorData.reason"
          >
            <UIcon
              name="i-lucide-triangle-alert"
              class="size-4 text-warning"
            />
            <span>—</span>
          </div>

          <template v-else-if="successData || lanData">
            <p
              v-if="options.showIp"
              class="font-mono font-medium truncate"
              :class="ipSizeClass"
            >
              {{ displayIp }}
            </p>

            <p
              v-if="lanLine"
              class="text-dimmed truncate"
              :class="secondarySizeClass"
            >
              {{ lanLine }}
            </p>

            <p
              v-if="options.showCityCountry && cityCountryLine"
              class="text-dimmed truncate"
              :class="secondarySizeClass"
            >
              {{ cityCountryLine }}
            </p>

            <template v-if="successData">
              <p
                v-if="options.showIsp && successData.isp"
                class="text-dimmed truncate"
                :class="secondarySizeClass"
              >
                {{ successData.isp }}
              </p>

              <p
                v-if="options.showAsn && successData.asn"
                class="text-dimmed truncate font-mono"
                :class="secondarySizeClass"
              >
                {{ successData.asn }}
              </p>
            </template>
          </template>

          <div
            v-else
            class="flex items-center gap-2 text-dimmed"
            :class="ipSizeClass"
          >
            <UIcon
              name="i-lucide-loader"
              class="size-4 animate-spin"
            />
            <span>Loading…</span>
          </div>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="flex items-center gap-3 min-w-0">
        <div :class="[flagSizeClass, 'shrink-0 rounded-full bg-elevated']" />
        <div class="flex-1 min-w-0">
          <div class="h-4 bg-elevated rounded w-2/3" />
        </div>
      </div>
    </template>
  </ClientOnly>
</template>
