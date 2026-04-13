export function useEditMode() {
  const isEditing = useState('editMode', () => false)
  const hasUnsavedChanges = useState('unsavedChanges', () => false)
  const showWidgetPicker = useState('showWidgetPicker', () => false)

  function enterEditMode() {
    isEditing.value = true
  }

  function exitEditMode() {
    isEditing.value = false
    hasUnsavedChanges.value = false
  }

  function markDirty() {
    if (isEditing.value) {
      hasUnsavedChanges.value = true
    }
  }

  return {
    isEditing,
    hasUnsavedChanges,
    showWidgetPicker,
    enterEditMode,
    exitEditMode,
    markDirty
  }
}
