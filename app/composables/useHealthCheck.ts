interface HealthStatus {
  online: boolean | null
  status: number
  latency: number
  loading: boolean
}

export function useHealthCheck(url: Ref<string>, intervalMs: Ref<number>) {
  const result = ref<HealthStatus>({
    online: null,
    status: 0,
    latency: 0,
    loading: true
  })

  let timer: number | null = null

  async function check() {
    if (!url.value) return

    try {
      const data = await $fetch<{ online: boolean, status: number, latency: number }>(
        '/api/health/check',
        { params: { url: url.value } }
      )
      result.value = { ...data, loading: false }
    } catch {
      result.value = { online: false, status: 0, latency: 0, loading: false }
    }
  }

  function start() {
    if (!import.meta.client) return
    stop()
    check()
    if (intervalMs.value > 0) {
      timer = window.setInterval(check, intervalMs.value)
    }
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  watch([url, intervalMs], () => {
    if (url.value) {
      start()
    } else {
      stop()
    }
  }, { immediate: true })

  onBeforeUnmount(() => stop())

  return { result: readonly(result) }
}
