<script setup>
import { ref, onMounted } from 'vue'
import RepoList from '@/components/RepoList.vue'
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <main>
    <div class="flex flex-col h-screen bg-gray-100">
        <NavBar />
        <div class="flex flex-col px-20 pb-20 overflow-y-auto h-fill">
            <RepoList />
        </div>
    </div>
  </main>
</template>
