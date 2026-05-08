import { applyDynamicPalette, isHex } from '~/utils/palette'

export const CUSTOM_PRIMARY = 'custom-primary'
export const CUSTOM_NEUTRAL = 'custom-neutral'

export function useTheme() {
  const appConfig = useAppConfig()

  function applyPrimary(value: string) {
    if (isHex(value)) {
      applyDynamicPalette(CUSTOM_PRIMARY, value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appConfig.ui.colors.primary = CUSTOM_PRIMARY as any
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appConfig.ui.colors.primary = value as any
    }
  }

  function applyNeutral(value: string) {
    if (isHex(value)) {
      applyDynamicPalette(CUSTOM_NEUTRAL, value)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appConfig.ui.colors.neutral = CUSTOM_NEUTRAL as any
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      appConfig.ui.colors.neutral = value as any
    }
  }

  return { applyPrimary, applyNeutral }
}
