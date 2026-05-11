import type { NetworkInfoResponse } from '~~/shared/types'

interface NetworkInfoState {
  data: NetworkInfoResponse | null
  loading: boolean
}

export function useNetworkInfo(mode: Ref<'server' | 'client'>, intervalMs: Ref<number>) {
  const state = ref<NetworkInfoState>({ data: null, loading: true })

  let timer: number | null = null
  let controller: AbortController | null = null

  async function refresh() {
    controller?.abort()
    const ownController = new AbortController()
    controller = ownController
    state.value = { data: state.value.data, loading: true }
    try {
      const data = await $fetch<NetworkInfoResponse>('/api/network/lookup', {
        params: { mode: mode.value },
        signal: ownController.signal
      })
      if (ownController.signal.aborted) return
      state.value = { data, loading: false }
    } catch (error) {
      if (ownController.signal.aborted) return
      state.value = {
        data: { error: 'unavailable', reason: (error as Error).message },
        loading: false
      }
    }
  }

  function start() {
    if (!import.meta.client) return
    stop()
    refresh()
    if (intervalMs.value > 0) {
      timer = window.setInterval(refresh, intervalMs.value)
    }
  }

  function stop() {
    controller?.abort()
    controller = null
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
  }

  watch([mode, intervalMs], () => start(), { immediate: true })

  onBeforeUnmount(() => stop())

  return { state: readonly(state), refresh }
}
