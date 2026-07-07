<script setup>

import { ref, watch, inject, onMounted, computed } from 'vue'
import { getRepo } from '@/services/github.js'
import RepoCard from '@/components/RepoCard.vue'
import { ViewportKey } from '@/keys/viewport'
import NavBar from '@/components/NavBar.vue'

const favourites = ref([])
const loadingFavourites = ref(false)
const page = ref(1)
const totalStored = ref(0)
const LIMIT = 10

const hasNextPage = computed(() => page.value * LIMIT < totalStored.value)

const { isMobile } = inject(ViewportKey)

function getStoredFavourites() {
    return JSON.parse(localStorage.getItem('favourites') || '[]')
}

// Slice localStorage favourites by page, then fetch full details from GitHub.
async function loadFavourites() {
    loadingFavourites.value = true
    const storedFavourites = getStoredFavourites()
    totalStored.value = storedFavourites.length

    const start = (page.value - 1) * LIMIT
    const pageItems = storedFavourites.slice(start, start + LIMIT)
    const detailedFavourites = []

    for (const repo of pageItems) {
        try {
            const details = await getRepo(repo.owner, repo.name)
            detailedFavourites.push(details)
        } catch (error) {
            console.error(`Failed to fetch details for ${repo.owner}/${repo.name}:`, error)
        }
    }

    favourites.value = detailedFavourites

    // If user removed items and current page is now empty, go back one page
    if (detailedFavourites.length === 0 && page.value > 1) {
        page.value--
        loadingFavourites.value = false
        return loadFavourites()
    }

    loadingFavourites.value = false
}

onMounted(loadFavourites)

watch(page, () => {
    loadFavourites()
})

</script>

<template>
  <main>
    <div class="flex flex-col h-screen bg-gray-100">
        <NavBar />
       <div 
        :class="['flex flex-col pb-30 overflow-y-auto h-fill',
        isMobile ? 'px-5' : 'px-20'
        ]">
            <!-- Favourites Section -->
            <h1 class="text-2xl font-bold py-10 border-b-2 border-primary-500 items-center">Favourites</h1>
            <div v-if="loadingFavourites" class="text-gray-500 text-center mt-10">
                Loading favourites...
            </div>
            <div v-else-if="!loadingFavourites && favourites.length === 0" class="text-gray-500 text-center mt-10">
                No favourites yet. Add some from the home page!
            </div>
            
            <div v-else class="my-10 grid gap-4" :class="isMobile ? 'grid-cols-1' : 'grid-cols-2'">
                <RepoCard
                    @favourite-changed="loadFavourites"
                    v-for="repo in favourites"
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

            <!-- Pagination -->
            <div v-if="totalStored > 0" class="flex justify-center mt-4">
                <button
                    :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                    page === 1 ? 'opacity-50 cursor-not-allowed' : '']"
                    :disabled="page === 1"
                    @click="page--"
                >
                    Previous
                </button>
                <button 
                :class="['px-4 py-2 mx-1 border-2 border-gray-300 text-primary rounded hover:bg-primary hover:text-white hover:cursor-pointer',
                  !hasNextPage ? 'opacity-50 cursor-not-allowed' : '']"
                :disabled="!hasNextPage"
                @click="page++"
                >
                Next
              </button>
            </div>

        </div>
    </div>
  </main>
</template>