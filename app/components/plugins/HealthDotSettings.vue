<script setup lang="ts">
const config = defineModel<Record<string, unknown>>('config', { default: () => ({}) })

const healthCheckUrl = computed({
  get: () => (config.value.healthCheckUrl as string) || '',
  set: (val: string) => { config.value = { ...config.value, healthCheckUrl: val || undefined } }
})

const intervalSeconds = computed({
  get: () => (config.value.intervalSeconds as number) || 30,
  set: (val: number) => { config.value = { ...config.value, intervalSeconds: val } }
})

const showLatency = computed({
  get: () => Boolean(config.value.showLatency),
  set: (val: boolean) => { config.value = { ...config.value, showLatency: val } }
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <UFormField
      label="Health Check URL"
      description="Leave empty to use the service URL"
    >
      <UInput
        v-model="healthCheckUrl"
        placeholder="https://example.com/health"
        type="url"
      />
    </UFormField>
    <UFormField label="Check Interval (seconds)">
      <UInputNumber
        v-model="intervalSeconds"
        :min="10"
        :max="300"
        :step="10"
      />
    </UFormField>
    <USwitch
      v-model="showLatency"
      label="Show response time"
      description="Display latency in ms next to the status dot"
    />
  </div>
</template>
