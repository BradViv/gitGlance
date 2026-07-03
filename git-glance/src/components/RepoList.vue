<script setup>

import { ref, onMounted, watch } from 'vue'
import { getMutlipleRepos } from '@/services/github.js'
import RepoCard from '@/components/RepoCard.vue'

const repos = ref([])
const loading = ref(false)
const error = ref(null)
const query = ref(null)
const limit = ref(20)
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

watch([page, limit], () => {
  loadRepos()
})
</script>

<template>
  <main>
    <!-- Search bar -->
    <div class="flex justify-center my-4 py-10 px-20 ">
      <input
        v-model="query"
        @keyup.enter="loading = true; page = 1; loadRepos()"
        type="text"
        placeholder="Search repositories..."
        class="w-1/2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
    
    <p v-if="loading" class="flex flex-row justify-center text-gray-500">Loading...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>
    <div v-else-if="repos" >
        <!-- Table of repos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RepoCard
                v-for="repo in repos"
                :key="repo.id"
                :name="repo.name"
                :owner="repo.owner.login"
                :description="repo.description"
                :stars="repo.stargazers_count"
                :language="repo.language"
                :lastUpdated="repo.updated_at"
            />
        </div>
        <!-- Pagination controls -->
        <div class="flex justify-center mt-4">
            <button 
                
            :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white',
                page === 1 ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === 1"
                @click="page--"
            >
                <
            </button>
            <button
                v-for="pageNumber in 5"
                :key="pageNumber"
                :class="[
                    'px-4 py-2 mx-1 border-2 rounded hover:cursor-pointer hover:bg-primary hover:text-white',
                    pageNumber === page || pageNumber === page % 5
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-primary hover:bg-primary-600',
                ]"
                @click="page = Math.floor((page - 1) / 5) * 5 + pageNumber"
                >
                {{ Math.floor((page - 1) / 5) * 5 + pageNumber }}
            </button>
            <button 
            :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white',
                page === 50 ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="page === 50"
                @click="page++"
            >
                >
            </button>
        </div>
    </div>

    <div v-else class="text-gray-500">No repositories found.</div>


  </main>
</template>
