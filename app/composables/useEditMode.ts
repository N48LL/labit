export function useEditMode() {
  const isEditing = useState('editMode', () => false)
  const hasUnsavedChanges = useState('unsavedChanges', () => false)

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
    enterEditMode,
    exitEditMode,
    markDirty
  }
}
