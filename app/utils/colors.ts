export const primaryColors: { name: string, label: string, hex: string }[] = [
  { name: 'green', label: 'Green', hex: '#22c55e' },
  { name: 'emerald', label: 'Emerald', hex: '#10b981' },
  { name: 'teal', label: 'Teal', hex: '#14b8a6' },
  { name: 'cyan', label: 'Cyan', hex: '#06b6d4' },
  { name: 'sky', label: 'Sky', hex: '#0ea5e9' },
  { name: 'blue', label: 'Blue', hex: '#3b82f6' },
  { name: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { name: 'violet', label: 'Violet', hex: '#8b5cf6' },
  { name: 'purple', label: 'Purple', hex: '#a855f7' },
  { name: 'fuchsia', label: 'Fuchsia', hex: '#d946ef' },
  { name: 'pink', label: 'Pink', hex: '#ec4899' },
  { name: 'rose', label: 'Rose', hex: '#f43f5e' },
  { name: 'red', label: 'Red', hex: '#ef4444' },
  { name: 'orange', label: 'Orange', hex: '#f97316' },
  { name: 'amber', label: 'Amber', hex: '#f59e0b' },
  { name: 'yellow', label: 'Yellow', hex: '#eab308' },
  { name: 'lime', label: 'Lime', hex: '#84cc16' }
]

export const neutralColors: { name: string, label: string, hex: string }[] = [
  { name: 'slate', label: 'Slate', hex: '#64748b' },
  { name: 'gray', label: 'Gray', hex: '#6b7280' },
  { name: 'zinc', label: 'Zinc', hex: '#71717a' },
  { name: 'neutral', label: 'Neutral', hex: '#737373' },
  { name: 'stone', label: 'Stone', hex: '#78716c' }
]

export const labelColors = primaryColors.map(c => ({ name: c.name, hex: c.hex }))

export const labelHex: Record<string, string> = Object.fromEntries(
  primaryColors.map(c => [c.name, c.hex])
)
