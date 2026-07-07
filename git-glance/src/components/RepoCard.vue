<script setup>
import { ref, onMounted, inject } from 'vue'
import { ViewportKey } from '@/keys/viewport'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    stars: {
        type: Number,
        required: true,
    },
    language: {
        type: String,
        required: false,
    },
    lastUpdated: {
        type: String,
        required: true,
    }
})

const isFavourited = ref(false)
const emit = defineEmits(['favourite-changed'])
const { width } = inject(ViewportKey)

const WIDTH_THRESHOLD = 800 * 2

function getFavourites() {
    return JSON.parse(localStorage.getItem('favourites') || '[]')
}

// Sync bookmark icon with localStorage on mount.
function checkIsFavourite() {
    const favourites = getFavourites()
    isFavourited.value = favourites.some(
        repo => repo.name === props.name && repo.owner === props.owner
    )
}
// Add repo to favourites. Checks if repo is already saved and pushes it to localstorage
function addToFavourites() {
    const favourites = getFavourites()
    const alreadySaved = favourites.some(
        repo => repo.name === props.name && repo.owner === props.owner
    )
    if (alreadySaved) return

    favourites.push({ name: props.name, owner: props.owner })
    localStorage.setItem('favourites', JSON.stringify(favourites))
    isFavourited.value = true
}

// Remove repo from favourites. Checks if repo is already gone and removes it from localstorage

function removeFromFavourites() {
    const favourites = getFavourites()
    const updated = favourites.filter(
        repo => !(repo.name === props.name && repo.owner === props.owner)
    )
    localStorage.setItem('favourites', JSON.stringify(updated))
    isFavourited.value = false
}

// Toggle bookmark state and notify parent (e.g. favourites page) to refresh.
function toggleFavourite() {
    if (isFavourited.value) {
        removeFromFavourites()
    } else {
        addToFavourites()
    }
    emit('favourite-changed')
}

onMounted(checkIsFavourite)
</script>

<template>
    <div :class="['flex flex-col h-40 border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow hover:shadow-md hover:-translate-y-1 transition-shadow duration-300 ease-in-out hover:border-primary hover:cursor-pointer',
        width >= WIDTH_THRESHOLD ? 'h-40' : 'h-50'
    ]">
        <RouterLink class="flex flex-col h-full justify-between" :to="{ name: 'repo', params: { owner: props.owner, name: props.name } }">
        
            <h2 class="flex flex-row w-full justify-between text-lg font-semibold text-primary">
                {{ props.name }}
                <button
                    type="button"
                    @click.stop.prevent="toggleFavourite"
                    :class="['bg-primary', 'material-symbols-outlined', 'text-sm', 'rounded', 'px-2', 'py-1', 'hover:opacity-90', 
                    isFavourited ? 'bg-primary text-white' : 'bg-white text-primary border border-primary'
                    ]"
                >
                    bookmark
                </button>
            </h2>
            <p class="flex-1 py-2 text-gray-500 line-clamp-2">{{ props.description }}</p>


            <div v-if="width >= WIDTH_THRESHOLD" class="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span class="flex flex-row items-center gap-2 w-3/12">
                    <img
                        :src="props.url"
                        :alt="props.owner"
                        class="h-8 w-8 rounded-full"
                      />
                    <h4 class="truncate">{{ props.owner }}</h4>
                </span>
                <span class="w-2/12 truncate">Stars: {{ props.stars }}</span>
                <span class="w-3/12 truncate">Language: {{props.language ? props.language : 'Not specified' }}</span>
                <span class="w-4/12 truncate">Last Updated: {{ new Date(props.lastUpdated).toLocaleString() }}</span>
            </div>
            <div v-else class="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                <span class="flex flex-row items-center gap-2">
                    <img
                        :src="props.url"
                        :alt="props.owner"
                        class="h-8 w-8 rounded-full"
                      />
                    <h4 class="truncate">{{ props.owner }}</h4>
                </span>
                <span class="flex flex-row items-center truncate">Stars: {{ props.stars }}</span>
                <span class="flex flex-row items-center truncate">Language: {{props.language ? props.language : 'Not specified' }}</span>
                <span class="flex flex-row items-center truncate">Last Updated: {{ new Date(props.lastUpdated).toLocaleString() }}</span>
            </div>
        </RouterLink>
    </div>
</template>
