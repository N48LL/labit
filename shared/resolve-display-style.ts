import type { DisplayStyleId } from './layouts'

export function resolveDisplayStyle(
  widgetDisplayStyle: DisplayStyleId | undefined,
  layoutDefaultForKind: DisplayStyleId | undefined,
  kindDefault: DisplayStyleId,
  validStyles: readonly DisplayStyleId[]
): DisplayStyleId {
  const valid = (id: DisplayStyleId | undefined): DisplayStyleId | null =>
    id !== undefined && validStyles.includes(id) ? id : null
  return valid(widgetDisplayStyle)
    ?? valid(layoutDefaultForKind)
    ?? kindDefault
}
