const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const LIGHTNESS: Record<number, number> = {
  50: 97,
  100: 93,
  200: 86,
  300: 77,
  400: 65,
  500: 50,
  600: 42,
  700: 33,
  800: 24,
  900: 16,
  950: 10
}

function hexToHsl(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '')
  const expanded = cleaned.length === 3
    ? cleaned.split('').map(ch => ch + ch).join('')
    : cleaned
  const red = parseInt(expanded.slice(0, 2), 16) / 255
  const green = parseInt(expanded.slice(2, 4), 16) / 255
  const blue = parseInt(expanded.slice(4, 6), 16) / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const lightness = (max + min) / 2

  if (max === min) return [0, 0, lightness * 100]

  const delta = max - min
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  const hueSegment = max === red
    ? (green - blue) / delta + (green < blue ? 6 : 0)
    : max === green
      ? (blue - red) / delta + 2
      : (red - green) / delta + 4

  return [hueSegment * 60, saturation * 100, lightness * 100]
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const sNorm = saturation / 100
  const lNorm = lightness / 100
  const chroma = sNorm * Math.min(lNorm, 1 - lNorm)
  const channel = (offset: number) => {
    const k = (offset + hue / 30) % 12
    const value = lNorm - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(255 * value).toString(16).padStart(2, '0')
  }
  return `#${channel(0)}${channel(8)}${channel(4)}`
}

export function generatePalette(hex: string): Record<number, string> {
  const [hue, saturation] = hexToHsl(hex)
  const palette: Record<number, string> = {}
  for (const shade of SHADES) {
    palette[shade] = hslToHex(hue, saturation, LIGHTNESS[shade]!)
  }
  return palette
}

export function paletteToCssVars(name: string, hex: string): string {
  const palette = generatePalette(hex)
  return Object.entries(palette)
    .map(([shade, value]) => `--color-${name}-${shade}:${value};`)
    .join('')
}

export function isHex(value: string | undefined | null): value is string {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}
