<script setup>
import { ref, watch } from 'vue'

const SORT_OPTIONS = [
  { value: 'BY_STARS', label: 'By stars' },
  { value: 'LAST_UPDATED', label: 'Last updated' },
]

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  sort: {
    type: String,
    default: 'BY_STARS',
  },
  language: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:open', 'apply'])

const draftSort = ref(props.sort)
const draftLanguage = ref(props.language)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    draftSort.value = props.sort
    draftLanguage.value = props.language
  }
})

function close() {
  emit('update:open', false)
}

function apply() {
  emit('apply', {
    sort: draftSort.value,
    language: draftLanguage.value.trim(),
  })
  close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/40" @click="close" />

      <aside class="relative flex h-full w-72 max-w-[85vw] flex-col bg-white p-6 shadow-xl">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            class="material-symbols-outlined text-gray-500 hover:text-gray-900"
            @click="close"
          >
            close
          </button>
        </div>

        <div class="flex flex-col gap-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">Sort by</label>
            <div class="flex flex-col gap-2">
              <label
                v-for="option in SORT_OPTIONS"
                :key="option.value"
                class="flex cursor-pointer items-center gap-2 rounded border border-gray-200 px-3 py-2 hover:border-primary"
              >
                <input
                  v-model="draftSort"
                  type="radio"
                  :value="option.value"
                  class="accent-primary"
                />
                <span class="text-sm text-gray-700">{{ option.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label for="language-filter" class="mb-2 block text-sm font-medium text-gray-700">
              Language
            </label>
            <input
              id="language-filter"
              v-model="draftLanguage"
              type="text"
              placeholder="e.g. javascript, python"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div class="mt-auto flex gap-3 pt-6">
          <button
            type="button"
            class="flex-1 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 rounded bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
            @click="apply"
          >
            Apply
          </button>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
