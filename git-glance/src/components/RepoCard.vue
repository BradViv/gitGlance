<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    owner: {
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
</script>

<template>
    <div class="flex flex-col justify-between border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow hover:shadow-md hover:-translate-y-1 transition-shadow duration-300 ease-in-out hover:border-primary hover:cursor-pointer">
        <RouterLink class="flex flex-col justify-between" :to="{ name: 'repo', params: { owner: props.owner, name: props.name } }">
        
            <h2 class="text-lg font-semibold text-primary">
                {{ props.name }}
            </h2>
            <p class="text-gray-500 line-clamp-2">{{ props.description }}</p>
            <div class="flex justify-between mt-2 text-sm text-gray-600">
                <span>Owner: {{ props.owner }}</span>
                <span>Stars: {{ props.stars }}</span>
                <span v-if="props.language">Language: {{ props.language }}</span>
                <span>Last Updated: {{ new Date(props.lastUpdated).toLocaleString() }}</span>
            </div>
        </RouterLink>
    </div>
</template>