import { isHex, paletteToCssVars } from '~/utils/palette'

export const CUSTOM_PRIMARY = 'custom-primary'
export const CUSTOM_NEUTRAL = 'custom-neutral'

export function useTheme() {
  const appConfig = useAppConfig()
  const activePrimary = useState<string>('theme:primary', () => appConfig.ui.colors.primary as string)
  const activeNeutral = useState<string>('theme:neutral', () => appConfig.ui.colors.neutral as string)

  function applyPrimary(value: string) {
    activePrimary.value = value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appConfig.ui.colors.primary = (isHex(value) ? CUSTOM_PRIMARY : value) as any
  }

  function applyNeutral(value: string) {
    activeNeutral.value = value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appConfig.ui.colors.neutral = (isHex(value) ? CUSTOM_NEUTRAL : value) as any
  }

  const customPaletteCss = computed(() => {
    const parts: string[] = []
    if (isHex(activePrimary.value)) parts.push(paletteToCssVars(CUSTOM_PRIMARY, activePrimary.value))
    if (isHex(activeNeutral.value)) parts.push(paletteToCssVars(CUSTOM_NEUTRAL, activeNeutral.value))
    return parts.length ? `:root{${parts.join('')}}` : ''
  })

  return { applyPrimary, applyNeutral, activePrimary, activeNeutral, customPaletteCss }
}
