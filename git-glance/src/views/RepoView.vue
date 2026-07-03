<script setup>
import { ref, watch } from 'vue'
import { getRepo } from '@/services/github.js'

const props = defineProps({
  owner: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
})

const repo = ref(null)
const loading = ref(false)
const error = ref(null)

async function loadRepo() {
  loading.value = true
  error.value = null
  repo.value = null

  try {
    repo.value = await getRepo(props.owner, props.name)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

watch(() => [props.owner, props.name], loadRepo, { immediate: true })
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <p v-if="loading" class="text-gray-500">Loading…</p>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <article v-else-if="repo" class="space-y-4">
      <header>
        <h1 class="text-2xl font-bold text-gray-900">{{ repo.full_name }}</h1>
        <p v-if="repo.description" class="mt-2 text-gray-600">{{ repo.description }}</p>
      </header>

      <dl class="flex flex-wrap gap-4 text-sm text-gray-700">
        <div>
          <dt class="inline font-medium">Stars:</dt>
          <dd class="inline ml-1">{{ repo.stargazers_count }}</dd>
        </div>
        <div>
          <dt class="inline font-medium">Forks:</dt>
          <dd class="inline ml-1">{{ repo.forks_count }}</dd>
        </div>
        <div>
          <dt class="inline font-medium">Open issues:</dt>
          <dd class="inline ml-1">{{ repo.open_issues_count }}</dd>
        </div>
        <div v-if="repo.language">
          <dt class="inline font-medium">Language:</dt>
          <dd class="inline ml-1">{{ repo.language }}</dd>
        </div>
      </dl>

      <a
        :href="repo.html_url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block text-blue-600 hover:underline"
      >
        View on GitHub →
      </a>
    </article>
  </main>
</template>
