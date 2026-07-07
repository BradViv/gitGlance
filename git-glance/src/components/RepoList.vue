<script setup>

import { ref, onMounted, watch, computed, inject } from 'vue'
import { getMutlipleRepos } from '@/services/github.js'
import RepoCard from '@/components/RepoCard.vue'
import { ViewportKey } from '@/keys/viewport'

const repos = ref([])
const loading = ref(false)
const error = ref(null)
const empty = ref(false)
const query = ref(null)
const limit = ref(20)
const page = ref(1)
const totalReturned = ref(1000)
const totalPages = computed(() => {
  const fromResults = Math.ceil(totalReturned.value / limit.value)
  const githubMax = Math.floor(1000 / limit.value)
  return Math.min(fromResults, githubMax)
})
const { isMobile } = inject(ViewportKey)


async function loadRepos() {
  loading.value = true
  error.value = null
  repos.value = null
  empty.value = false

  try {
    const result = await getMutlipleRepos(query.value, limit.value, page.value)
    totalReturned.value = Math.min(result.total_count, 1000)
    console.log('Total returned:', totalReturned.value)

    if (result.total_count === 0) {
      empty.value = true
    } else {
      empty.value = false
    }

    repos.value = result.items
   
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadRepos)

watch([page, limit], () => {
  loadRepos()
})

const visiblePages = computed(() => {
  const radius = isMobile.value ? 1 : 2
  let start = Math.max(1, page.value - radius)
  let end = Math.min(totalPages.value, start + radius * 2)
  start = Math.max(1, end - radius * 2)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const paginationBtnClass = computed(() => [
  'border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
  isMobile.value ? 'px-2 py-1 mx-0.5 text-xs' : 'px-4 py-2 mx-1 text-sm',
])
</script>

<template>
  <main>
    <!-- Search bar -->
    <div class="flex justify-center my-4 py-10">
      <input
        v-model="query"
        @keyup.enter="loading = true; page = 1; loadRepos()"
        type="text"
        placeholder="Search repositories..."
        :class="['px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white',
        isMobile ? 'w-full' : 'w-3/4'
        ]"
      />
    </div>
    
    <p v-if="loading" class="flex flex-row justify-center text-gray-500">Loading...</p>
    <p v-else-if="error" class="flex flex-row justify-center text-red-600">An error has occurred</p>
    <p v-else-if="empty" class="flex flex-row justify-center text-gray-500">No repositories found.</p>
    <div v-else-if="repos" >
        <!-- Table of repos -->
        <div class="text-center text-gray-500 mb-4">Showing page: {{ page }} / {{ totalPages }}</div>
        <div v-if="isMobile" class="grid grid-cols-1 gap-4">
            <RepoCard
                v-for="repo in repos"
                :key="repo.id"
                :name="repo.name"
                :owner="repo.owner.login"
                :url="repo.owner.avatar_url"
                :description="repo.description"
                :stars="repo.stargazers_count"
                :language="repo.language"
                :lastUpdated="repo.updated_at"
            />
        </div>
        <div v-else class="grid grid-cols-2 gap-4">
            <RepoCard
                v-for="repo in repos"
                :key="repo.id"
                :name="repo.name"
                :owner="repo.owner.login"
                :url="repo.owner.avatar_url"
                :description="repo.description"
                :stars="repo.stargazers_count"
                :language="repo.language"
                :lastUpdated="repo.updated_at"
            />
        </div>
        <!-- Pagination controls -->
        <div class="flex justify-center mt-4">
            <button
                v-if="!isMobile"
                :class="[paginationBtnClass, page === 1 ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === 1"
                @click="page = 1"
            >
                <<
            </button>
            <button
                :class="[paginationBtnClass, page === 1 ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === 1"
                @click="page--"
            >
                <
            </button>
            <button
                v-for="pageNum in visiblePages"
                :key="pageNum"
                :class="[paginationBtnClass, page === pageNum ? 'bg-primary text-white' : '']"
                @click="page = pageNum"
            >
                {{ pageNum }}
            </button>
            <button
                :class="[paginationBtnClass, page === totalPages ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === totalPages"
                @click="page++"
            >
                >
            </button>
            <button
                v-if="!isMobile"
                :class="[paginationBtnClass, page === totalPages ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === totalPages"
                @click="page = totalPages"
            >
                >>
            </button>
        </div>
    </div>

    <div v-else class="text-gray-500">No repositories found.</div>


  </main>
</template>
