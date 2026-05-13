<script setup lang="ts">
import type { BoardSection } from '~~/shared/types'
import { OPERATOR_HEALTH_KEY, type OperatorHealthMap } from './operatorKeys'

const store = useBoardStore()
const { isEditing, hasUnsavedChanges, showWidgetPicker, enterEditMode, exitEditMode, markDirty } = useEditMode()
const readOnly = useRuntimeConfig().public.readOnly
const toast = useToast()

const showBoardSettings = ref(false)
const showIconPicker = ref(false)

const healthMap = ref<OperatorHealthMap>(new Map())
provide(OPERATOR_HEALTH_KEY, healthMap)

const allServiceRows = computed(() => {
  if (!store.board) return []
  return store.board.sections.flatMap(section =>
    section.widgets
      .filter(w => w.kind === 'service-link')
      .map(widget => ({ section, widget }))
  )
})

const visibleServiceRows = computed(() =>
  allServiceRows.value.filter(({ section }) => !section.collapsed)
)

const nonServiceWidgets = computed(() => {
  if (!store.board) return []
  return store.board.sections.flatMap(section =>
    section.collapsed
      ? []
      : section.widgets.filter(w => w.kind !== 'service-link').map(widget => ({ section, widget }))
  )
})

const trackedCount = computed(() => healthMap.value.size)
const onlineCount = computed(() => {
  let n = 0
  for (const entry of healthMap.value.values()) if (entry.online === true) n++
  return n
})
const issuesCount = computed(() => {
  let n = 0
  for (const entry of healthMap.value.values()) if (entry.online === false) n++
  return n
})
const avgPing = computed(() => {
  const lats: number[] = []
  for (const entry of healthMap.value.values()) {
    if (entry.online === true && entry.latency > 0) lats.push(entry.latency)
  }
  if (!lats.length) return null
  return Math.round(lats.reduce((a, b) => a + b, 0) / lats.length)
})

const now = ref<Date | null>(null)
let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  now.value = new Date()
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})
onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const timeStr = computed(() => now.value ? now.value.toLocaleTimeString([], { hour12: false }) : '')
const dateStr = computed(() => now.value ? now.value.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : '')

function toggleSection(s: BoardSection) {
  if (!s.collapsible) return
  store.updateSection(s.id, { collapsed: !s.collapsed })
  markDirty()
}

// Stable color per section, derived from id when user hasn't set one.
const GROUP_PALETTE = ['#5e6ad2', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#10b981', '#3b82f6', '#f43f5e']
function sectionDotColor(s: BoardSection, index: number): string {
  return s.defaults?.cardColor || GROUP_PALETTE[index % GROUP_PALETTE.length] || '#94a3b8'
}

async function handleSave() {
  try {
    await store.save()
    exitEditMode()
  } catch {
    toast.add({ title: 'Failed to save', description: 'Your changes could not be saved. Please try again.', color: 'error' })
  }
}

async function handleCancel() {
  if (hasUnsavedChanges.value) await store.load()
  exitEditMode()
}

function handleAddSection() {
  store.addSection()
  markDirty()
}

const boardIcon = computed(() => store.board?.icon || 'i-lucide-rabbit')
const boardIconType = computed<'iconify' | 'url' | 'custom'>(() => store.board?.iconType || 'iconify')

function updateIcon(value: string) {
  if (!store.board) return
  store.board.icon = value
  markDirty()
}

function updateIconType(value: 'iconify' | 'url' | 'custom') {
  if (!store.board) return
  store.board.iconType = value
  markDirty()
}

const visibleSections = computed(() => store.board?.sections ?? [])
</script>

<template>
  <div
    v-if="store.board"
    class="operator-shell font-operator bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased text-[15px] leading-snug"
  >
    <div class="grid min-h-screen grid-cols-[240px_minmax(0,1fr)] grid-rows-[auto_1fr]">
      <header class="col-span-2 sticky top-0 z-20 flex items-center gap-3 h-[60px] px-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/85 dark:bg-zinc-950/85 backdrop-blur">
        <button
          v-if="isEditing"
          type="button"
          class="rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors p-1 -m-1 cursor-pointer"
          aria-label="Change icon"
          @click="showIconPicker = true"
        >
          <ServiceIcon
            :icon="boardIcon"
            :icon-type="boardIconType"
            class="size-6"
          />
        </button>
        <ServiceIcon
          v-else
          :icon="boardIcon"
          :icon-type="boardIconType"
          class="size-7"
        />
        <input
          v-if="isEditing"
          :value="store.board.title"
          class="text-[18px] font-bold bg-transparent outline-none border-b border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 px-0.5 w-40 tracking-tight"
          @input="store.board!.title = ($event.target as HTMLInputElement).value; markDirty()"
        >
        <span
          v-else
          class="text-[18px] font-bold tracking-tight"
        >{{ store.board.title }}</span>
        <span class="text-zinc-300 dark:text-zinc-700">/</span>
        <span class="text-[14px] text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded font-medium">{{ store.board.slug || 'home' }}</span>

        <template v-if="!isEditing">
          <span class="flex-1" />
          <span class="hidden md:inline font-operator-mono text-[14.5px] tabular-nums text-zinc-900 dark:text-zinc-100">{{ timeStr }}</span>
          <span class="hidden lg:inline text-[14px] text-zinc-500 dark:text-zinc-500">{{ dateStr }}</span>
          <button
            v-if="!readOnly"
            type="button"
            class="size-9 rounded-md flex items-center justify-center text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label="Edit"
            @click="enterEditMode"
          >
            <UIcon
              name="i-lucide-pencil"
              class="size-4"
            />
          </button>
          <UColorModeButton />
        </template>
        <template v-else>
          <span class="flex-1" />
          <UButton
            icon="i-lucide-layout-grid"
            label="Section"
            size="sm"
            variant="soft"
            color="neutral"
            @click="handleAddSection"
          />
          <UButton
            icon="i-lucide-plus"
            label="Widget"
            size="sm"
            variant="soft"
            color="neutral"
            @click="showWidgetPicker = true"
          />
          <UButton
            icon="i-lucide-palette"
            size="sm"
            variant="soft"
            color="neutral"
            aria-label="Board settings"
            @click="showBoardSettings = true"
          />
          <span class="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
          <UButton
            label="Cancel"
            size="sm"
            variant="ghost"
            color="neutral"
            @click="handleCancel"
          />
          <UButton
            label="Save"
            icon="i-lucide-save"
            size="sm"
            :loading="store.saving"
            @click="handleSave"
          />
        </template>
      </header>

      <aside class="border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/40">
        <div class="sticky top-[60px] p-3 flex flex-col gap-1 max-h-[calc(100vh-60px)] overflow-y-auto">
          <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[15px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <UIcon
              name="i-lucide-home"
              class="size-[18px] text-zinc-500 dark:text-zinc-500"
            />
            <span>Overview</span>
            <span class="ml-auto font-operator-mono text-[13px] text-zinc-500 dark:text-zinc-500 tabular-nums">{{ allServiceRows.length }}</span>
          </div>

          <div class="font-operator-mono text-[12.5px] tracking-[0.14em] uppercase text-zinc-400 dark:text-zinc-600 px-3 pt-5 pb-2">
            Groups
          </div>
          <button
            v-for="(section, idx) in visibleSections"
            :key="section.id"
            type="button"
            class="flex items-center gap-2.5 px-3 py-2 rounded-md text-[15px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors text-left"
            :class="{ 'opacity-50': section.collapsed, 'cursor-pointer': section.collapsible }"
            @click="toggleSection(section)"
          >
            <span
              class="size-2.5 rounded-sm shrink-0"
              :style="{ background: sectionDotColor(section, idx) }"
            />
            <span class="truncate">{{ section.title }}</span>
            <span class="ml-auto font-operator-mono text-[13px] text-zinc-400 dark:text-zinc-600 tabular-nums">{{ section.widgets.filter(w => w.kind === 'service-link').length }}</span>
          </button>

          <div class="mt-auto pt-4 px-3 border-t border-zinc-200 dark:border-zinc-800 text-[13.5px] text-zinc-500 dark:text-zinc-500 space-y-1">
            <div class="flex justify-between">
              <span>monitored</span>
              <span class="font-operator-mono text-zinc-700 dark:text-zinc-300 tabular-nums">{{ trackedCount }} / {{ allServiceRows.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>layout</span>
              <span class="font-operator-mono text-zinc-700 dark:text-zinc-300">operator</span>
            </div>
          </div>
        </div>
      </aside>

      <main class="px-7 py-6 flex flex-col gap-6 min-w-0">
        <div
          v-if="nonServiceWidgets.length"
          class="grid gap-3"
          :style="{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }"
        >
          <div
            v-for="{ widget, section } in nonServiceWidgets"
            :key="widget.id"
            class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3"
          >
            <EditorContextMenu
              :widget="widget"
              :section="section"
              :disabled="!isEditing"
            >
              <WidgetRenderer :widget="widget" />
            </EditorContextMenu>
          </div>
        </div>

        <div class="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div class="font-operator-mono text-[12.5px] tracking-[0.14em] uppercase text-zinc-400 dark:text-zinc-600">
              Overview
            </div>
            <h1 class="text-[34px] font-semibold tracking-[-0.02em] mt-1 leading-none">
              All services
            </h1>
          </div>
          <div class="flex gap-3">
            <div class="px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-w-[132px]">
              <div class="font-operator-mono text-[12px] tracking-[0.14em] uppercase text-zinc-400 dark:text-zinc-600">
                Online
              </div>
              <div class="flex items-baseline gap-1.5 mt-1.5">
                <span class="font-operator-mono text-[32px] font-semibold text-green-600 dark:text-green-500 tabular-nums tracking-[-0.03em] leading-none">{{ onlineCount }}</span>
                <span class="text-[14px] text-zinc-400 dark:text-zinc-600">/ {{ trackedCount || allServiceRows.length }}</span>
              </div>
            </div>
            <div class="px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-w-[132px]">
              <div class="font-operator-mono text-[12px] tracking-[0.14em] uppercase text-zinc-400 dark:text-zinc-600">
                Avg ping
              </div>
              <div class="flex items-baseline gap-1.5 mt-1.5">
                <span class="font-operator-mono text-[32px] font-semibold tabular-nums tracking-[-0.03em] leading-none">{{ avgPing ?? '—' }}</span>
                <span class="text-[14px] text-zinc-400 dark:text-zinc-600">ms</span>
              </div>
            </div>
            <div class="px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 min-w-[132px]">
              <div class="font-operator-mono text-[12px] tracking-[0.14em] uppercase text-zinc-400 dark:text-zinc-600">
                Issues
              </div>
              <div class="flex items-baseline gap-1.5 mt-1.5">
                <span
                  class="font-operator-mono text-[32px] font-semibold tabular-nums tracking-[-0.03em] leading-none"
                  :class="issuesCount > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-900 dark:text-zinc-100'"
                >{{ issuesCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div class="grid grid-cols-[28px_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_130px_28px] gap-3 items-center px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 font-operator-mono text-[12.5px] tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-600 font-medium">
            <span />
            <span>Service</span>
            <span>Host</span>
            <span>Group</span>
            <span class="text-right">Latency</span>
            <span />
          </div>
          <div v-if="visibleServiceRows.length">
            <OperatorServiceRow
              v-for="(row, i) in visibleServiceRows"
              :key="row.widget.id"
              :widget="row.widget"
              :section="row.section"
              :alt="i % 2 === 1"
            />
          </div>
          <div
            v-else
            class="px-4 py-14 text-center text-[14px] text-zinc-500 dark:text-zinc-500"
          >
            <UIcon
              name="i-lucide-inbox"
              class="size-6 mb-2 mx-auto text-zinc-300 dark:text-zinc-700"
            />
            <p v-if="allServiceRows.length === 0">
              No services yet.
              <button
                v-if="isEditing"
                class="underline cursor-pointer"
                @click="showWidgetPicker = true"
              >
                Add one
              </button>
              <span v-else>Enter edit mode to add some.</span>
            </p>
            <p v-else>
              All groups are collapsed.
            </p>
          </div>
        </div>
      </main>
    </div>

    <EditorWidgetPicker v-model:open="showWidgetPicker" />
    <EditorBoardSettings v-model:open="showBoardSettings" />

    <UModal
      v-model:open="showIconPicker"
      title="Site Icon"
      description="Pick the icon shown in the toolbar and used as the browser favicon."
    >
      <template #body>
        <IconPicker
          :icon="boardIcon"
          :icon-type="boardIconType"
          @update:icon="updateIcon"
          @update:icon-type="updateIconType"
        />
      </template>
      <template #footer>
        <div class="flex justify-end">
          <UButton
            label="Done"
            @click="showIconPicker = false"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.operator-shell {
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}
</style>
