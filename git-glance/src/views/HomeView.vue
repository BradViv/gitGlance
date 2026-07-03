<script setup>
import { ref, onMounted } from 'vue'
import RepoList from '@/components/RepoList.vue'
</script>

<template>
  <main>
    <div class="flex flex-col h-screen bg-gray-100">
        <h1 class="text-2xl font-bold py-10 pl-5 border-b-2 border-blue-500 items-center">GitGlance</h1>
        <div class="flex flex-col p-10 overflow-y-auto h-fill">
            <RepoList />
        </div>
    </div>
  </main>
</template>
