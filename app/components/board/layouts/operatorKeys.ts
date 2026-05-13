import type { InjectionKey, Ref } from 'vue'

export interface OperatorHealthEntry {
  online: boolean | null
  latency: number
}

export type OperatorHealthMap = Map<string, OperatorHealthEntry>

export const OPERATOR_HEALTH_KEY: InjectionKey<Ref<OperatorHealthMap>> = Symbol('operator-health')
