<script setup>

import { ref, onMounted } from 'vue'
import { getMutlipleRepos } from '@/services/github.js'

const repos = ref([])
const loading = ref(false)
const error = ref(null)
const query = ref('stars:>0')
const limit = ref(30)
const page = ref(1)

async function loadRepos() {
  loading.value = true
  error.value = null
  repos.value = null

  try {
    repos.value = await getMutlipleRepos(query.value, limit.value, page.value)
    console.log(repos.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadRepos)
</script>
<template>
  <main>
    <p v-if="loading" class="text-gray-500">Loading…</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>
    <table v-else-if="repos" class="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th class="border border-gray-300 px-4 py-2">Repository</th>
          <th class="border border-gray-300 px-4 py-2">Owner</th>
          <th class="border border-gray-300 px-4 py-2">Description</th>
          <th class="border border-gray-300 px-4 py-2">Stars</th>
          <th class="border border-gray-300 px-4 py-2">Primary Programming Language</th>
          <th class="border border-gray-300 px-4 py-2">Last Updated</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="repo in repos" :key="repo.id">
          <td class="border border-gray-300 px-4 py-2">
            <RouterLink :to="{ name: 'repo', params: { owner: repo.owner.login, name: repo.name } }" class="text-blue-600 hover:underline">
              {{ repo.full_name }}
            </RouterLink>
          </td>
          <td class="border border-gray-300 px-4 py-2">{{ repo.owner.login }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ repo.description }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ repo.stargazers_count }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ repo.language }}</td>
          <td class="border border-gray-300 px-4 py-2">{{ new Date(repo.updated_at).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>
